import type { ICategoryRow } from '../../../database/interfaces/i-category-row.js';
import type { CategoryResponseDto } from '../dto/category-response.dto.js';
import type { CategoryTreeResponseDto } from '../dto/category-tree-response.dto.js';
import type { ICategoryTreeItem } from '../interfaces/i-category-tree-item.js';

export const toCategoryResponse = (
  row: ICategoryRow,
): CategoryResponseDto => ({
  id: row.id,
  name: row.name,
  companyId: row.companyId,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const toCategoryTreeResponse = (
  item: ICategoryTreeItem,
): CategoryTreeResponseDto => ({
  id: item.id,
  name: item.name,
  companyId: item.companyId,
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  productCount: item.productCount,
  subcategories: item.subcategories.map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
    categoryId: subcategory.categoryId,
    status: subcategory.status,
    createdAt: subcategory.createdAt,
    updatedAt: subcategory.updatedAt,
    productCount: subcategory.productCount,
  })),
});
