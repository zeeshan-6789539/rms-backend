import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindCompaniesOptions {
  page: number;
  limit: number;
  search?: string;
  city?: string;
  status?: boolean;
  sortOrder: SortOrder;
}
