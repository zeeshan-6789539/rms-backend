import type { IPaymentListRow } from './i-payment-list-row.js';

export interface IPaymentListResult {
  items: IPaymentListRow[];
  totalItems: number;
}
