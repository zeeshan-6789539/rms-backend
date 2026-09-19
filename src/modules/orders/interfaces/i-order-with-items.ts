import type { IOrderItemRow } from '../../../database/interfaces/i-order-item-row.js';
import type { IOrderRow } from '../../../database/interfaces/i-order-row.js';

export interface IOrderItemWithProductName extends IOrderItemRow {
  // Null when the product row backing this snapshot no longer exists
  productName: string | null;
}

export interface IOrderWithItems extends IOrderRow {
  items: IOrderItemWithProductName[];
}
