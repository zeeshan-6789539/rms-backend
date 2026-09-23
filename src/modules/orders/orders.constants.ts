import { OrderStatus } from '../../common/enums/order-status.enum.js';

// Database constraint name -> the message a client should see when it trips
export const ORDER_CONSTRAINT_MESSAGES: Record<string, string> = {
  order_items_quantity_positive: 'Quantity must be greater than zero',
};

// Which statuses an order is allowed to move to from its current one
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [],
};

// Statuses whose stock was decremented at checkout, so cancelling out of them
// must restore it. Mirrors STOCK_AFFECTING_STATUSES in demo-data.seed.ts.
export const STOCK_RESTORING_CANCEL_SOURCES = new Set<OrderStatus>([
  OrderStatus.PAID,
]);
