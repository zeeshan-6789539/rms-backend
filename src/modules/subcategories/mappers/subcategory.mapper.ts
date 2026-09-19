import type { ISubcategoryRow } from '../../../database/interfaces/i-subcategory-row.js';
import type { SubcategoryResponseDto } from '../dto/subcategory-response.dto.js';

export const toSubcategoryResponse = (
  row: ISubcategoryRow,
): SubcategoryResponseDto => ({
  id: row.id,
  name: row.name,
  categoryId: row.categoryId,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
