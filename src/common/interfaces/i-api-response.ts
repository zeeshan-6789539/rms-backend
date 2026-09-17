import type { IApiError } from './i-api-error.js';

// One envelope for every response, success or failure — data is null on failure,
// error is null on success, and message is always populated.
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: IApiError | null;
}
