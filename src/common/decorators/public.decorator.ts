import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/metadata.constants.js';

// Opts a route out of the globally registered JwtAuthGuard
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
