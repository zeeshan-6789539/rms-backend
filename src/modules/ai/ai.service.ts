import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiError,
  GoogleGenAI,
  type Content,
  type FunctionCall,
  type GenerateContentResponse,
  type Part,
  ThinkingLevel,
} from '@google/genai';
import { ZodError } from 'zod';
import { aiConfig } from '../../config/ai.config.js';
import type { IAiConfig } from '../../config/interfaces/i-ai-config.js';
import { AiToolsService } from './ai-tools.service.js';
import {
  AI_MAX_TOOL_ROUNDS,
  AI_PROVIDER_ATTEMPT_TIMEOUT_MS,
  AI_PROVIDER_BUSY_MESSAGE,
  AI_PROVIDER_RETRY_ATTEMPTS,
  AI_PROVIDER_RETRY_INITIAL_DELAY_S,
  AI_PROVIDER_RETRY_MAX_DELAY_S,
  buildAiSystemInstruction,
} from './ai.constants.js';

// fetch rejects with one of these when the per-attempt timeout aborts the request
const ABORT_ERROR_NAMES = new Set(['AbortError', 'TimeoutError']);
import type { AiChatRequestDto } from './dto/ai-chat-request.dto.js';
import type { AiChatResponseDto } from './dto/ai-chat-response.dto.js';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: GoogleGenAI | undefined;

  constructor(
    @Inject(aiConfig.KEY) private readonly config: IAiConfig,
    private readonly aiTools: AiToolsService,
  ) {
    this.client = config.apiKey
      ? new GoogleGenAI({
          apiKey: config.apiKey,
          httpOptions: {
            timeout: AI_PROVIDER_ATTEMPT_TIMEOUT_MS,
            retryOptions: {
              attempts: AI_PROVIDER_RETRY_ATTEMPTS,
              initialDelay: AI_PROVIDER_RETRY_INITIAL_DELAY_S,
              maxDelay: AI_PROVIDER_RETRY_MAX_DELAY_S,
            },
          },
        })
      : undefined;
  }

  async chat(companyId: string, dto: AiChatRequestDto): Promise<AiChatResponseDto> {
    const client = this.getClientOrFail();
    const contents: Content[] = [
      ...(dto.history ?? []).map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      { role: 'user', parts: [{ text: dto.message }] },
    ];
    const toolsUsed: string[] = [];

    for (let round = 0; round < AI_MAX_TOOL_ROUNDS; round++) {
      const response = await this.generate(client, contents);
      const calls = response.functionCalls ?? [];

      if (calls.length === 0) {
        const reply = response.text?.trim();

        if (!reply) {
          throw new BadGatewayException(
            'The AI assistant returned an empty answer. Rephrase the question and try again.',
          );
        }

        return { reply, toolsUsed };
      }

      // The model turn is sent back verbatim so Gemini keeps its thought signatures
      contents.push(
        response.candidates?.[0]?.content ?? {
          role: 'model',
          parts: calls.map((functionCall) => ({ functionCall })),
        },
      );
      toolsUsed.push(...calls.map((call) => call.name ?? 'unknown'));
      contents.push({
        role: 'user',
        parts: await Promise.all(calls.map((call) => this.runTool(companyId, call))),
      });
    }

    throw new BadGatewayException(
      `The AI assistant needed more than ${AI_MAX_TOOL_ROUNDS} lookups to answer. Ask a narrower question and retry.`,
    );
  }

  private getClientOrFail(): GoogleGenAI {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'The AI assistant is not configured on this server. Ask the administrator to set GOOGLE_STUDIO_KEY.',
      );
    }

    return this.client;
  }

  private async generate(
    client: GoogleGenAI,
    contents: Content[],
  ): Promise<GenerateContentResponse> {
    try {
      return await client.models.generateContent({
        model: this.config.model,
        contents,
        config: {
          systemInstruction: buildAiSystemInstruction(new Date().toISOString().slice(0, 10)),
          tools: [{ functionDeclarations: this.aiTools.declarations }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
    } catch (error) {
      if (error instanceof Error && ABORT_ERROR_NAMES.has(error.name)) {
        this.logger.warn(`Gemini request timed out after ${AI_PROVIDER_ATTEMPT_TIMEOUT_MS}ms`);
        throw new ServiceUnavailableException(AI_PROVIDER_BUSY_MESSAGE);
      }

      if (!(error instanceof ApiError)) {
        throw error;
      }

      this.logger.error(`Gemini request failed with status ${error.status}: ${error.message}`);

      if (error.status === Number(HttpStatus.TOO_MANY_REQUESTS)) {
        throw new HttpException(
          'The AI assistant has hit its usage limit. Wait a minute and try again.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (error.status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
        throw new ServiceUnavailableException(AI_PROVIDER_BUSY_MESSAGE);
      }

      throw new BadGatewayException(
        'The AI provider could not process the request. Try again shortly; if it keeps failing, contact support.',
      );
    }
  }

  // Lookup failures go back to Gemini so it can explain them; anything unexpected still reaches the filter
  private async runTool(companyId: string, call: FunctionCall): Promise<Part> {
    const name = call.name ?? '';
    const tool = this.aiTools.find(name);
    const respond = (response: Record<string, unknown>): Part => ({
      functionResponse: { id: call.id, name, response },
    });

    if (!tool) {
      return respond({ error: `Unknown tool "${name}". Use one of the declared tools.` });
    }

    try {
      return respond({ result: await tool.execute(companyId, call.args ?? {}) });
    } catch (error) {
      if (error instanceof ZodError) {
        return respond({ error: `Invalid arguments for ${name}: ${error.message}` });
      }

      if (error instanceof HttpException) {
        return respond({ error: error.message });
      }

      throw error;
    }
  }
}
