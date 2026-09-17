import type { payments } from '../schema/payments.schema.js';

export type IPaymentRow = typeof payments.$inferSelect;
export type INewPaymentRow = typeof payments.$inferInsert;
