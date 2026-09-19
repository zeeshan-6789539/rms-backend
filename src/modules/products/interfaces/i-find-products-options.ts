import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindProductsOptions {
  page: number;
  limit: number;
  search?: string;
  companyId: string;
  subcategoryId?: string;
  status?: boolean;
  sortOrder: SortOrder;
}
