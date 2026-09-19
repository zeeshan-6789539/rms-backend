import type { OrderStatus } from '../../../common/enums/order-status.enum.js';
import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindOrdersOptions {
  page: number;
  limit: number;
  search?: string;
  companyId: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  sortOrder: SortOrder;
}
