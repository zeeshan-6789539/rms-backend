import type { subcategories } from '../schema/subcategories.schema.js';

export type ISubcategoryRow = typeof subcategories.$inferSelect;
export type INewSubcategoryRow = typeof subcategories.$inferInsert;
