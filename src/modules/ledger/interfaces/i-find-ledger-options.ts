import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindLedgerOptions {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  leaseId?: string;
  sortOrder: SortOrder;
}
