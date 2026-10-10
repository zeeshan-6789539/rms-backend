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
  type GenerateContentParameters,
  type GenerateContentResponse,
} from '@google/genai';
import { aiConfig } from '../../config/ai.config.js';
import type { IAiConfig } from '../../config/interfaces/i-ai-config.js';
import {
  AI_PROVIDER_ATTEMPT_TIMEOUT_MS,
  AI_PROVIDER_BUSY_MESSAGE,
  AI_PROVIDER_RETRY_ATTEMPTS,
  AI_PROVIDER_RETRY_INITIAL_DELAY_S,
  AI_PROVIDER_RETRY_MAX_DELAY_S,
} from './ai.constants.js';

// fetch rejects with one of these when the per-attempt timeout aborts the request
const ABORT_ERROR_NAMES = new Set(['AbortError', 'TimeoutError']);

// The single Gemini entry point, so chat, transcription and speech fail with the same messages
@Injectable()
export class GeminiClientService {
  private readonly logger = new Logger(GeminiClientService.name);
  private readonly client: GoogleGenAI | undefined;

  constructor(@Inject(aiConfig.KEY) config: IAiConfig) {
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

  async generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse> {
    const client = this.getClientOrFail();

    try {
      return await client.models.generateContent(params);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private getClientOrFail(): GoogleGenAI {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'The AI assistant is not configured on this server. Ask the administrator to set GOOGLE_STUDIO_KEY.',
      );
    }

    return this.client;
  }

  private toHttpException(error: unknown): unknown {
    if (error instanceof Error && ABORT_ERROR_NAMES.has(error.name)) {
      this.logger.warn('Gemini request timed out');
      return new ServiceUnavailableException(AI_PROVIDER_BUSY_MESSAGE);
    }

    // Node's fetch throws a bare TypeError("fetch failed") when Google can't be reached at all
    if (error instanceof TypeError && error.message === 'fetch failed') {
      this.logger.warn(
        `Gemini unreachable: ${error.cause instanceof Error ? error.cause.message : error.message}`,
      );
      return new ServiceUnavailableException(AI_PROVIDER_BUSY_MESSAGE);
    }

    if (!(error instanceof ApiError)) {
      return error;
    }

    this.logger.error(`Gemini request failed with status ${error.status}: ${error.message}`);

    if (error.status === Number(HttpStatus.TOO_MANY_REQUESTS)) {
      return new HttpException(
        'The AI assistant has hit its usage limit. Wait a minute and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (error.status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      return new ServiceUnavailableException(AI_PROVIDER_BUSY_MESSAGE);
    }

    return new BadGatewayException(
      'The AI provider could not process the request. Try again shortly; if it keeps failing, contact support.',
    );
  }
}
