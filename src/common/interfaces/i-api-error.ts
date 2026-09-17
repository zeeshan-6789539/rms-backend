import type { ErrorCode } from '../enums/error-code.enum.js';

export interface IApiError {
  code: ErrorCode;
  details: string[];
}
