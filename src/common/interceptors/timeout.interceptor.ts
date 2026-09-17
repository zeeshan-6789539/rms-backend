import {
  Inject,
  Injectable,
  RequestTimeoutException,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import {
  catchError,
  throwError,
  timeout,
  TimeoutError,
  type Observable,
} from 'rxjs';
import { appConfig } from '../../config/app.config.js';
import type { IAppConfig } from '../../config/interfaces/i-app-config.js';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(@Inject(appConfig.KEY) private readonly config: IAppConfig) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.config.requestTimeoutMs),
      catchError((error: unknown) =>
        throwError(() =>
          error instanceof TimeoutError ? new RequestTimeoutException() : error,
        ),
      ),
    );
  }
}
