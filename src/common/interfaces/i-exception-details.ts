import type { ErrorCode } from '../enums/error-code.enum.js';

export interface IExceptionDetails {
  message: string;
  code: ErrorCode;
  details: string[];
}
