import type { ILeaseListRow } from './i-lease-list-row.js';

export interface ILeaseListResult {
  items: ILeaseListRow[];
  totalItems: number;
}
