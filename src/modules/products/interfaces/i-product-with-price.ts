import type { IProductRow } from '../../../database/interfaces/i-product-row.js';

// A product row enriched with its currently active price-history entry
export interface IProductWithPrice extends IProductRow {
  sellPrice: string;
  purchasePrice: string;
}
