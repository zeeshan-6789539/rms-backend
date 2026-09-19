import type { categories } from '../schema/categories.schema.js';

export type ICategoryRow = typeof categories.$inferSelect;
export type INewCategoryRow = typeof categories.$inferInsert;
