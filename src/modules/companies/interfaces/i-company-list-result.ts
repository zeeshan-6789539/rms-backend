import type { ICompanyRow } from '../../../database/interfaces/i-company-row.js';

export interface ICompanyListResult {
  items: ICompanyRow[];
  totalItems: number;
}
