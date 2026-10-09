import {
  Inject,
  Injectable,
  RequestTimeoutException,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  catchError,
  throwError,
  timeout,
  TimeoutError,
  type Observable,
} from 'rxjs';
import { appConfig } from '../../config/app.config.js';
import type { IAppConfig } from '../../config/interfaces/i-app-config.js';
import { REQUEST_TIMEOUT_KEY } from '../constants/metadata.constants.js';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject(appConfig.KEY) private readonly config: IAppConfig,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const timeoutMs =
      this.reflector.getAllAndOverride<number | undefined>(REQUEST_TIMEOUT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? this.config.requestTimeoutMs;

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((error: unknown) =>
        throwError(() =>
          error instanceof TimeoutError ? new RequestTimeoutException() : error,
        ),
      ),
    );
  }
}
