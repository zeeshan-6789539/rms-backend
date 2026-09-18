import type { ICompanyRow } from '../../../database/interfaces/i-company-row.js';
import type { ICompanyCounts } from './i-company-counts.js';

export interface ICompanyWithCounts extends ICompanyRow, ICompanyCounts {}
