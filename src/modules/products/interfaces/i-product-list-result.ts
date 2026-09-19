import type { IProductWithPrice } from './i-product-with-price.js';

export interface IProductListResult {
  items: IProductWithPrice[];
  totalItems: number;
}
