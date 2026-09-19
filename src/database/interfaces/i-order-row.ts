import type { orders } from '../schema/orders.schema.js';

export type IOrderRow = typeof orders.$inferSelect;
export type INewOrderRow = typeof orders.$inferInsert;
