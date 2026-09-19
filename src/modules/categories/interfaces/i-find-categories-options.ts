import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindCategoriesOptions {
  page: number;
  limit: number;
  search?: string;
  companyId: string;
  status?: boolean;
  sortOrder: SortOrder;
}
