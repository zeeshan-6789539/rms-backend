import type { IOrderWithItems } from './i-order-with-items.js';

export interface IOrderListResult {
  items: IOrderWithItems[];
  totalItems: number;
}
