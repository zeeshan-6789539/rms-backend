import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { IAuthenticatedUser } from '../../modules/auth/interfaces/i-authenticated-user.js';

export const CurrentUser = createParamDecorator(
  (
    property: keyof IAuthenticatedUser | undefined,
    context: ExecutionContext,
  ): IAuthenticatedUser | IAuthenticatedUser[keyof IAuthenticatedUser] => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: IAuthenticatedUser }>();

    return property ? request.user[property] : request.user;
  },
);
