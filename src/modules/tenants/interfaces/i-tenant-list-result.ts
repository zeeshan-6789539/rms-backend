import type { ITenantListRow } from './i-tenant-list-row.js';

export interface ITenantListResult {
  items: ITenantListRow[];
  totalItems: number;
}
