import type { tenants } from '../schema/tenants.schema.js';

export type ITenantRow = typeof tenants.$inferSelect;
export type INewTenantRow = typeof tenants.$inferInsert;
