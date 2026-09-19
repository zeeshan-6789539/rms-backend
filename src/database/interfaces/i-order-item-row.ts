import type { orderItems } from '../schema/order-items.schema.js';

export type IOrderItemRow = typeof orderItems.$inferSelect;
export type INewOrderItemRow = typeof orderItems.$inferInsert;
