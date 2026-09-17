import type { UserRole } from '../../../common/enums/user-role.enum.js';

export interface IAuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
  companyId: string | null;
}
