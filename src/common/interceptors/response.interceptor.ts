import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { map, type Observable } from 'rxjs';
import {
  RESPONSE_MESSAGE_KEY,
  SKIP_RESPONSE_TRANSFORM_KEY,
} from '../constants/metadata.constants.js';
import {
  DEFAULT_RESPONSE_MESSAGES,
  FALLBACK_RESPONSE_MESSAGE,
} from '../constants/response-message.constants.js';
import type { IApiResponse } from '../interfaces/i-api-response.js';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IApiResponse<T> | T> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    const message = this.resolveMessage(context);

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message,
        data: data ?? null,
        error: null,
      })),
    );
  }

  private resolveMessage(context: ExecutionContext): string {
    const declared = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (declared) {
      return declared;
    }

    const { method } = context.switchToHttp().getRequest<Request>();

    return DEFAULT_RESPONSE_MESSAGES[method] ?? FALLBACK_RESPONSE_MESSAGE;
  }
}
