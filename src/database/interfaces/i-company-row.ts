import type { companies } from '../schema/companies.schema.js';

export type ICompanyRow = typeof companies.$inferSelect;
export type INewCompanyRow = typeof companies.$inferInsert;
