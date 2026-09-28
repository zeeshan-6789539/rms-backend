import type { ICompanyRow } from '../../../database/interfaces/i-company-row.js';

export type ICompanyMailCredentials = Pick<ICompanyRow, 'name' | 'email' | 'mailPassword'>;
