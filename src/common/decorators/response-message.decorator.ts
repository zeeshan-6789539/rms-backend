import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import { RESPONSE_MESSAGE_KEY } from '../constants/metadata.constants.js';

// Sets the `message` the ResponseInterceptor puts on a successful envelope
export const ResponseMessage = (message: string): CustomDecorator =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
