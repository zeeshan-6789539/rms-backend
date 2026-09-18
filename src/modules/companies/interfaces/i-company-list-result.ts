import type { ICompanyWithCounts } from './i-company-with-counts.js';

export interface ICompanyListResult {
  items: ICompanyWithCounts[];
  totalItems: number;
}
