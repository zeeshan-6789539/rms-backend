import type { IPaginationMeta } from './i-pagination-meta.js';

export interface IPaginatedResult<T> {
  items: T[];
  meta: IPaginationMeta;
}
