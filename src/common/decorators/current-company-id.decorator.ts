import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { IAuthenticatedUser } from '../../modules/auth/interfaces/i-authenticated-user.js';

// Company-scoped routes are restricted to @Roles(UserRole.CLIENT_ADMIN), and the
// users_super_admin_has_no_company check constraint guarantees that role always
// carries a companyId, so this is never null in practice.
export const CurrentCompanyId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: IAuthenticatedUser }>();

    return request.user.companyId as string;
  },
);
