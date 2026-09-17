import type { IPaginatedResult } from '../interfaces/i-paginated-result.js';

export const getOffset = (page: number, limit: number): number =>
  (page - 1) * limit;

export const buildPaginatedResult = <T>(
  items: T[],
  totalItems: number,
  page: number,
  limit: number,
): IPaginatedResult<T> => {
  const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

  return {
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};
