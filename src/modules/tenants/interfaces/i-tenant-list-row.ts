import type { IAssignedEntity } from '../../../common/interfaces/i-assigned-entity.js';
import type { ITenantRow } from '../../../database/interfaces/i-tenant-row.js';

// Tenant row plus the property/properties they currently hold an active lease on
export interface ITenantListRow extends ITenantRow {
  properties: IAssignedEntity[];
}
