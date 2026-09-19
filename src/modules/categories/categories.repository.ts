import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, inArray, type SQL } from 'drizzle-orm';
import { SortOrder } from '../../common/enums/sort-order.enum.js';
import { withDatabaseErrors } from '../../common/utils/database-error.util.js';
import { getOffset } from '../../common/utils/pagination.util.js';
import { buildSearchCondition } from '../../common/utils/query.util.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type {
  ICategoryRow,
  INewCategoryRow,
} from '../../database/interfaces/i-category-row.js';
import type { IDrizzleDb } from '../../database/interfaces/i-drizzle-db.js';
import {
  categories,
  products,
  subcategories,
} from '../../database/schema/index.js';
import { CATEGORY_CONSTRAINT_MESSAGES } from './categories.constants.js';
import type { ICategoryListResult } from './interfaces/i-category-list-result.js';
import type { ICategoryTreeItem } from './interfaces/i-category-tree-item.js';
import type { IFindCategoriesOptions } from './interfaces/i-find-categories-options.js';

const SEARCHABLE_COLUMNS = [categories.name];

@Injectable()
export class CategoriesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  async findById(id: string): Promise<ICategoryRow | undefined> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return row;
  }

  async findMany(
    options: IFindCategoriesOptions,
  ): Promise<ICategoryListResult> {
    const where = this.buildFilters(options);
    const direction = options.sortOrder === SortOrder.ASC ? asc : desc;

    const [items, [total]] = await Promise.all([
      this.db
        .select()
        .from(categories)
        .where(where)
        .orderBy(direction(categories.createdAt), direction(categories.id))
        .limit(options.limit)
        .offset(getOffset(options.page, options.limit)),
      this.db.select({ value: count() }).from(categories).where(where),
    ]);

    return { items, totalItems: total?.value ?? 0 };
  }

  async create(data: INewCategoryRow): Promise<ICategoryRow> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db.insert(categories).values(data).returning();

      return row;
    }, CATEGORY_CONSTRAINT_MESSAGES);
  }

  async update(
    id: string,
    data: Partial<INewCategoryRow>,
  ): Promise<ICategoryRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();

      return row;
    }, CATEGORY_CONSTRAINT_MESSAGES);
  }

  // "Delete" is a status flip — the row is kept for audit and referential integrity
  async setStatus(
    id: string,
    status: boolean,
  ): Promise<ICategoryRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(categories)
        .set({ status })
        .where(eq(categories.id, id))
        .returning();

      return row;
    }, CATEGORY_CONSTRAINT_MESSAGES);
  }

  async countActiveSubcategories(categoryId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(subcategories)
      .where(
        and(
          eq(subcategories.categoryId, categoryId),
          eq(subcategories.status, true),
        ),
      );

    return row?.value ?? 0;
  }

  // Categories -> active subcategories -> active product counts, assembled in
  // memory for the "tree" view rather than a single deep join.
  async findTreeForCompany(companyId: string): Promise<ICategoryTreeItem[]> {
    const categoryRows = await this.db
      .select()
      .from(categories)
      .where(
        and(eq(categories.companyId, companyId), eq(categories.status, true)),
      )
      .orderBy(asc(categories.name));

    if (categoryRows.length === 0) {
      return [];
    }

    const categoryIds = categoryRows.map((row) => row.id);
    const subcategoryRows = await this.db
      .select()
      .from(subcategories)
      .where(
        and(
          inArray(subcategories.categoryId, categoryIds),
          eq(subcategories.status, true),
        ),
      )
      .orderBy(asc(subcategories.name));

    const subcategoryIds = subcategoryRows.map((row) => row.id);
    const productCounts =
      subcategoryIds.length > 0
        ? await this.db
            .select({ subcategoryId: products.subcategoryId, value: count() })
            .from(products)
            .where(
              and(
                inArray(products.subcategoryId, subcategoryIds),
                eq(products.status, true),
              ),
            )
            .groupBy(products.subcategoryId)
        : [];

    const productCountBySubcategory = new Map(
      productCounts.map((row) => [row.subcategoryId, row.value]),
    );

    return categoryRows.map((category) => {
      const categorySubcategories = subcategoryRows
        .filter((subcategory) => subcategory.categoryId === category.id)
        .map((subcategory) => ({
          ...subcategory,
          productCount: productCountBySubcategory.get(subcategory.id) ?? 0,
        }));

      return {
        ...category,
        productCount: categorySubcategories.reduce(
          (sum, subcategory) => sum + subcategory.productCount,
          0,
        ),
        subcategories: categorySubcategories,
      };
    });
  }

  private buildFilters(options: IFindCategoriesOptions): SQL | undefined {
    const conditions: SQL[] = [eq(categories.companyId, options.companyId)];

    if (options.status !== undefined) {
      conditions.push(eq(categories.status, options.status));
    }

    const search = buildSearchCondition(options.search, SEARCHABLE_COLUMNS);

    if (search) {
      conditions.push(search);
    }

    return and(...conditions);
  }
}
