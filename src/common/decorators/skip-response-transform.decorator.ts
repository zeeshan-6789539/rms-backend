import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import { SKIP_RESPONSE_TRANSFORM_KEY } from '../constants/metadata.constants.js';

// Returns the handler payload verbatim instead of wrapping it in IApiResponse
export const SkipResponseTransform = (): CustomDecorator =>
  SetMetadata(SKIP_RESPONSE_TRANSFORM_KEY, true);
