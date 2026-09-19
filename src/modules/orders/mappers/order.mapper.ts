import type { OrderItemResponseDto } from '../dto/order-item-response.dto.js';
import type { OrderResponseDto } from '../dto/order-response.dto.js';
import type { IOrderItemWithProductName } from '../interfaces/i-order-with-items.js';
import type { IOrderWithItems } from '../interfaces/i-order-with-items.js';

export const toOrderItemResponse = (
  item: IOrderItemWithProductName,
): OrderItemResponseDto => ({
  id: item.id,
  productId: item.productId,
  productName: item.productName,
  quantity: item.quantity,
  price: Number(item.price),
  createdAt: item.createdAt,
});

export const toOrderResponse = (row: IOrderWithItems): OrderResponseDto => {
  const items = row.items.map(toOrderItemResponse);

  return {
    id: row.id,
    companyId: row.companyId,
    userId: row.userId,
    status: row.status,
    items,
    total: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};
