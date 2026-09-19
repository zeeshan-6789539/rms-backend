import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  type SQL,
} from 'drizzle-orm';
import { SortOrder } from '../../common/enums/sort-order.enum.js';
import { withDatabaseErrors } from '../../common/utils/database-error.util.js';
import { getOffset } from '../../common/utils/pagination.util.js';
import { buildSearchCondition } from '../../common/utils/query.util.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type {
  INewSubcategoryRow,
  ISubcategoryRow,
} from '../../database/interfaces/i-subcategory-row.js';
import type { IDrizzleDb } from '../../database/interfaces/i-drizzle-db.js';
import {
  categories,
  products,
  subcategories,
} from '../../database/schema/index.js';
import type { IFindSubcategoriesOptions } from './interfaces/i-find-subcategories-options.js';
import type { ISubcategoryListResult } from './interfaces/i-subcategory-list-result.js';
import { SUBCATEGORY_CONSTRAINT_MESSAGES } from './subcategories.constants.js';

const SEARCHABLE_COLUMNS = [subcategories.name];

@Injectable()
export class SubcategoriesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  async findById(id: string): Promise<ISubcategoryRow | undefined> {
    const [row] = await this.db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, id))
      .limit(1);

    return row;
  }

  // Subcategories have no company_id of their own — company scoping is done
  // by joining through the parent category.
  async findMany(
    options: IFindSubcategoriesOptions,
  ): Promise<ISubcategoryListResult> {
    const where = this.buildFilters(options);
    const direction = options.sortOrder === SortOrder.ASC ? asc : desc;

    const [items, [total]] = await Promise.all([
      this.db
        .select({ ...getTableColumns(subcategories) })
        .from(subcategories)
        .innerJoin(categories, eq(subcategories.categoryId, categories.id))
        .where(where)
        .orderBy(
          direction(subcategories.createdAt),
          direction(subcategories.id),
        )
        .limit(options.limit)
        .offset(getOffset(options.page, options.limit)),
      this.db
        .select({ value: count() })
        .from(subcategories)
        .innerJoin(categories, eq(subcategories.categoryId, categories.id))
        .where(where),
    ]);

    return { items, totalItems: total?.value ?? 0 };
  }

  async create(data: INewSubcategoryRow): Promise<ISubcategoryRow> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .insert(subcategories)
        .values(data)
        .returning();

      return row;
    }, SUBCATEGORY_CONSTRAINT_MESSAGES);
  }

  async update(
    id: string,
    data: Partial<INewSubcategoryRow>,
  ): Promise<ISubcategoryRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(subcategories)
        .set(data)
        .where(eq(subcategories.id, id))
        .returning();

      return row;
    }, SUBCATEGORY_CONSTRAINT_MESSAGES);
  }

  async setStatus(
    id: string,
    status: boolean,
  ): Promise<ISubcategoryRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(subcategories)
        .set({ status })
        .where(eq(subcategories.id, id))
        .returning();

      return row;
    }, SUBCATEGORY_CONSTRAINT_MESSAGES);
  }

  async countActiveProducts(subcategoryId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(products)
      .where(
        and(
          eq(products.subcategoryId, subcategoryId),
          eq(products.status, true),
        ),
      );

    return row?.value ?? 0;
  }

  private buildFilters(options: IFindSubcategoriesOptions): SQL | undefined {
    const conditions: SQL[] = [eq(categories.companyId, options.companyId)];

    if (options.categoryId) {
      conditions.push(eq(subcategories.categoryId, options.categoryId));
    }

    if (options.status !== undefined) {
      conditions.push(eq(subcategories.status, options.status));
    }

    const search = buildSearchCondition(options.search, SEARCHABLE_COLUMNS);

    if (search) {
      conditions.push(search);
    }

    return and(...conditions);
  }
}
