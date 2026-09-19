import type { IProductPriceHistoryRow } from '../../../database/interfaces/i-product-price-history-row.js';
import type { ProductPriceHistoryResponseDto } from '../dto/product-price-history-response.dto.js';
import type { ProductResponseDto } from '../dto/product-response.dto.js';
import type { IProductWithPrice } from '../interfaces/i-product-with-price.js';

export const toProductResponse = (
  row: IProductWithPrice,
): ProductResponseDto => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  sellPrice: Number(row.sellPrice),
  purchasePrice: Number(row.purchasePrice),
  quantity: row.quantity,
  remainingStock: row.quantity,
  subcategoryId: row.subcategoryId,
  companyId: row.companyId,
  createdByUserId: row.createdByUserId,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const toProductPriceHistoryResponse = (
  row: IProductPriceHistoryRow,
): ProductPriceHistoryResponseDto => ({
  id: row.id,
  productId: row.productId,
  sellPrice: Number(row.sellPrice),
  purchasePrice: Number(row.purchasePrice),
  effectiveFrom: row.effectiveFrom,
  effectiveTo: row.effectiveTo,
  createdAt: row.createdAt,
});
