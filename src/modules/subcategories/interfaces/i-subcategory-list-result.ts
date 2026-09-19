import type { ISubcategoryRow } from '../../../database/interfaces/i-subcategory-row.js';

export interface ISubcategoryListResult {
  items: ISubcategoryRow[];
  totalItems: number;
}
