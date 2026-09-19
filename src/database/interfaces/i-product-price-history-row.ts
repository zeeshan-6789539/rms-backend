import type { productPriceHistory } from '../schema/product-price-history.schema.js';

export type IProductPriceHistoryRow = typeof productPriceHistory.$inferSelect;
export type INewProductPriceHistoryRow =
  typeof productPriceHistory.$inferInsert;
