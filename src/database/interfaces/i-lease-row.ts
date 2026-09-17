import type { leases } from '../schema/leases.schema.js';

export type ILeaseRow = typeof leases.$inferSelect;
export type INewLeaseRow = typeof leases.$inferInsert;
