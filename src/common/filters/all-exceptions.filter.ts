import {
  Catch,
  HttpStatus,
  Inject,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { appConfig } from '../../config/app.config.js';
import type { IAppConfig } from '../../config/interfaces/i-app-config.js';
import type { IApiResponse } from '../interfaces/i-api-response.js';
import {
  extractExceptionDetails,
  resolveStatusCode,
} from '../utils/exception.util.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(@Inject(appConfig.KEY) private readonly config: IAppConfig) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const statusCode = resolveStatusCode(exception);
    const { message, code, details } = extractExceptionDetails(
      exception,
      this.config.nodeEnv !== 'production',
    );

    const body: IApiResponse<null> = {
      success: false,
      message,
      data: null,
      error: { code, details },
    };

    const label = `${request.method} ${request.url} -> ${statusCode} [${code}]`;

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${label}: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${label}: ${message}`);
    }

    response.status(statusCode).json(body);
  }
}
