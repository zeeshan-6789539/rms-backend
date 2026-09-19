import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindSubcategoriesOptions {
  page: number;
  limit: number;
  search?: string;
  companyId: string;
  categoryId?: string;
  status?: boolean;
  sortOrder: SortOrder;
}
