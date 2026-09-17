import { ilike, or, type SQL } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { escapeLikePattern } from './string.util.js';

// Case-insensitive "contains" across any set of text columns, for list endpoints
export const buildSearchCondition = (
  term: string | undefined,
  columns: PgColumn[],
): SQL | undefined => {
  const trimmed = term?.trim();

  if (!trimmed || columns.length === 0) {
    return undefined;
  }

  const pattern = `%${escapeLikePattern(trimmed)}%`;

  return or(...columns.map((column) => ilike(column, pattern)));
};
