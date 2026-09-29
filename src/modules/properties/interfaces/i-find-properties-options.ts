import type { PropertyType } from '../../../common/enums/property-type.enum.js';
import type { SortOrder } from '../../../common/enums/sort-order.enum.js';

export interface IFindPropertiesOptions {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  city?: string;
  propertyType?: PropertyType;
  status?: boolean;
  sortOrder: SortOrder;
}
