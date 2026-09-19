import type { products } from '../schema/products.schema.js';

export type IProductRow = typeof products.$inferSelect;
export type INewProductRow = typeof products.$inferInsert;
