import type { ITenantRow } from '../../../database/interfaces/i-tenant-row.js';

export interface ITenantListResult {
  items: ITenantRow[];
  totalItems: number;
}
