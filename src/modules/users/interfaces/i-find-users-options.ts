import type { SortOrder } from '../../../common/enums/sort-order.enum.js';
import type { UserRole } from '../../../common/enums/user-role.enum.js';

export interface IFindUsersOptions {
  page: number;
  limit: number;
  search?: string;
  companyId?: string;
  role?: UserRole;
  status?: boolean;
  sortOrder: SortOrder;
}
