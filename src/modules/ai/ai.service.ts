import { BadGatewayException, HttpException, Inject, Injectable } from '@nestjs/common';
import { ThinkingLevel, type Content, type FunctionCall, type Part } from '@google/genai';
import { ZodError } from 'zod';
import { aiConfig } from '../../config/ai.config.js';
import type { IAiConfig } from '../../config/interfaces/i-ai-config.js';
import { AiToolsService } from './ai-tools.service.js';
import { AI_MAX_TOOL_ROUNDS, buildAiSystemInstruction } from './ai.constants.js';
import type { AiChatRequestDto } from './dto/ai-chat-request.dto.js';
import type { AiChatResponseDto } from './dto/ai-chat-response.dto.js';
import { GeminiClientService } from './gemini-client.service.js';

@Injectable()
export class AiService {
  constructor(
    @Inject(aiConfig.KEY) private readonly config: IAiConfig,
    private readonly gemini: GeminiClientService,
    private readonly aiTools: AiToolsService,
  ) {}

  async chat(companyId: string, dto: AiChatRequestDto): Promise<AiChatResponseDto> {
    const contents: Content[] = [
      ...(dto.history ?? []).map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      { role: 'user', parts: [{ text: dto.message }] },
    ];
    const toolsUsed: string[] = [];

    for (let round = 0; round < AI_MAX_TOOL_ROUNDS; round++) {
      const response = await this.gemini.generateContent({
        model: this.config.model,
        contents,
        config: {
          systemInstruction: buildAiSystemInstruction(new Date().toISOString().slice(0, 10)),
          tools: [{ functionDeclarations: this.aiTools.declarations }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
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
