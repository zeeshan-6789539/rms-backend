import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import { REQUEST_TIMEOUT_KEY } from '../constants/metadata.constants.js';

// Overrides the global REQUEST_TIMEOUT_MS for one route or controller
export const RequestTimeout = (timeoutMs: number): CustomDecorator =>
  SetMetadata(REQUEST_TIMEOUT_KEY, timeoutMs);
