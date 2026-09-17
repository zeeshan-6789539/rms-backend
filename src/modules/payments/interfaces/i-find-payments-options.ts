import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindPaymentsOptions {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  leaseId?: string;
  sortOrder: SortOrder;
}
