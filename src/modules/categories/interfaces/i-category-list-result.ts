import type { ICategoryRow } from '../../../database/interfaces/i-category-row.js';

export interface ICategoryListResult {
  items: ICategoryRow[];
  totalItems: number;
}
