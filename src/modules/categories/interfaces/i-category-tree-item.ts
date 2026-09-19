import type { ICategoryRow } from '../../../database/interfaces/i-category-row.js';
import type { ISubcategoryRow } from '../../../database/interfaces/i-subcategory-row.js';

export interface ISubcategoryTreeItem extends ISubcategoryRow {
  productCount: number;
}

export interface ICategoryTreeItem extends ICategoryRow {
  productCount: number;
  subcategories: ISubcategoryTreeItem[];
}
