import type { UserRole } from '../../../common/enums/user-role.enum.js';

export interface IAccessTokenPayload {
  sub: string;
  role: UserRole;
  companyId: string | null;
}

export interface IRefreshTokenPayload {
  sub: string;
  jti: string;
}
