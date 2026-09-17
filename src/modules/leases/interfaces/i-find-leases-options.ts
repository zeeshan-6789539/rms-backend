import type { LeaseStatus } from '../../../common/enums/lease-status.enum.js';
import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindLeasesOptions {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  propertyId?: string;
  tenantId?: string;
  status?: LeaseStatus;
  sortOrder: SortOrder;
}
