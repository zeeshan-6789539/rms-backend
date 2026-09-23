import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  isNull,
  sql,
  type SQL,
} from 'drizzle-orm';
import { withDatabaseErrors } from '../../common/utils/database-error.util.js';
import { getOffset } from '../../common/utils/pagination.util.js';
import { buildSearchCondition } from '../../common/utils/query.util.js';
import { SortOrder } from '../../common/enums/sort-order.enum.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type {
  IDrizzleDb,
  IDrizzleTransaction,
} from '../../database/interfaces/i-drizzle-db.js';
import type {
  INewProductRow,
  IProductRow,
} from '../../database/interfaces/i-product-row.js';
import type { IProductPriceHistoryRow } from '../../database/interfaces/i-product-price-history-row.js';
import {
  productPriceHistory,
  products,
} from '../../database/schema/index.js';
import type { IFindProductsOptions } from './interfaces/i-find-products-options.js';
import type { IProductListResult } from './interfaces/i-product-list-result.js';
import type { IProductWithPrice } from './interfaces/i-product-with-price.js';
import { PRODUCT_CONSTRAINT_MESSAGES } from './products.constants.js';

const SEARCHABLE_COLUMNS = [products.name];

interface IPriceInput {
  sellPrice: string;
  purchasePrice: string;
}

@Injectable()
export class ProductsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  async findByIdWithPrice(
    id: string,
    db: IDrizzleDb = this.db,
  ): Promise<IProductWithPrice | undefined> {
    const [row] = await db
      .select(this.withPriceColumns())
      .from(products)
      .innerJoin(
        productPriceHistory,
        and(
          eq(productPriceHistory.productId, products.id),
          isNull(productPriceHistory.effectiveTo),
        ),
      )
      .where(eq(products.id, id))
      .limit(1);

    return row;
  }

  async findMany(options: IFindProductsOptions): Promise<IProductListResult> {
    const where = this.buildFilters(options);
    const direction = options.sortOrder === SortOrder.ASC ? asc : desc;

    const [items, [total]] = await Promise.all([
      this.db
        .select(this.withPriceColumns())
        .from(products)
        .innerJoin(
          productPriceHistory,
          and(
            eq(productPriceHistory.productId, products.id),
            isNull(productPriceHistory.effectiveTo),
          ),
        )
        .where(where)
        .orderBy(direction(products.createdAt), direction(products.id))
        .limit(options.limit)
        .offset(getOffset(options.page, options.limit)),
      this.db
        .select({ value: count() })
        .from(products)
        .innerJoin(
          productPriceHistory,
          and(
            eq(productPriceHistory.productId, products.id),
            isNull(productPriceHistory.effectiveTo),
          ),
        )
        .where(where),
    ]);

    return { items, totalItems: total?.value ?? 0 };
  }

  // Products scoped to a company for checkout, with their current price and stock
  async findManyWithPriceByIds(
    ids: string[],
    companyId: string,
  ): Promise<IProductWithPrice[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.db
      .select(this.withPriceColumns())
      .from(products)
      .innerJoin(
        productPriceHistory,
        and(
          eq(productPriceHistory.productId, products.id),
          isNull(productPriceHistory.effectiveTo),
        ),
      )
      .where(
        and(
          inArray(products.id, ids),
          eq(products.companyId, companyId),
          eq(products.status, true),
        ),
      );
  }

  // Product + its initial price row are inserted together, or not at all
  async create(
    data: INewProductRow,
    price: IPriceInput,
  ): Promise<IProductWithPrice> {
    return withDatabaseErrors(async () => {
      return this.db.transaction(async (tx) => {
        const [product] = await tx.insert(products).values(data).returning();
        const now = new Date();
        const [priceRow] = await tx
          .insert(productPriceHistory)
          .values({
            productId: product.id,
            sellPrice: price.sellPrice,
            purchasePrice: price.purchasePrice,
            effectiveFrom: now,
            effectiveTo: null,
          })
          .returning();

        return {
          ...product,
          sellPrice: priceRow.sellPrice,
          purchasePrice: priceRow.purchasePrice,
        };
      });
    }, PRODUCT_CONSTRAINT_MESSAGES);
  }

  async updateFields(
    id: string,
    data: Partial<INewProductRow>,
  ): Promise<IProductRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(products)
        .set(data)
        .where(eq(products.id, id))
        .returning();

      return row;
    }, PRODUCT_CONSTRAINT_MESSAGES);
  }

  // Closes out the current price row and opens a new one, atomically
  async updatePrice(productId: string, price: IPriceInput): Promise<void> {
    const now = new Date();

    await this.db.transaction(async (tx) => {
      await tx
        .update(productPriceHistory)
        .set({ effectiveTo: now })
        .where(
          and(
            eq(productPriceHistory.productId, productId),
            isNull(productPriceHistory.effectiveTo),
          ),
        );

      await tx.insert(productPriceHistory).values({
        productId,
        sellPrice: price.sellPrice,
        purchasePrice: price.purchasePrice,
        effectiveFrom: now,
        effectiveTo: null,
      });
    });
  }

  async setStatus(
    id: string,
    status: boolean,
  ): Promise<IProductRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(products)
        .set({ status })
        .where(eq(products.id, id))
        .returning();

      return row;
    }, PRODUCT_CONSTRAINT_MESSAGES);
  }

  async findCurrentPrice(
    productId: string,
  ): Promise<IProductPriceHistoryRow | undefined> {
    const [row] = await this.db
      .select()
      .from(productPriceHistory)
      .where(
        and(
          eq(productPriceHistory.productId, productId),
          isNull(productPriceHistory.effectiveTo),
        ),
      )
      .limit(1);

    return row;
  }

  async findPriceHistory(
    productId: string,
  ): Promise<IProductPriceHistoryRow[]> {
    return this.db
      .select()
      .from(productPriceHistory)
      .where(eq(productPriceHistory.productId, productId))
      .orderBy(desc(productPriceHistory.effectiveFrom));
  }

  // Guarded decrement: only succeeds if enough stock remains, so it is safe
  // to call inside a transaction shared with another module (orders checkout)
  async decrementStock(
    tx: IDrizzleTransaction,
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const result = await tx
      .update(products)
      .set({ quantity: sql`${products.quantity} - ${quantity}` })
      .where(and(eq(products.id, productId), gte(products.quantity, quantity)))
      .returning({ id: products.id });

    return result.length > 0;
  }

  // Reverses decrementStock — used when a paid order is cancelled. A removed
  // product has nothing left to restore stock onto, so a miss is a no-op.
  async incrementStock(
    tx: IDrizzleTransaction,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await tx
      .update(products)
      .set({ quantity: sql`${products.quantity} + ${quantity}` })
      .where(eq(products.id, productId));
  }

  private withPriceColumns() {
    return {
      ...getTableColumns(products),
      sellPrice: productPriceHistory.sellPrice,
      purchasePrice: productPriceHistory.purchasePrice,
    };
  }

  private buildFilters(options: IFindProductsOptions): SQL | undefined {
    const conditions: SQL[] = [eq(products.companyId, options.companyId)];

    if (options.subcategoryId) {
      conditions.push(eq(products.subcategoryId, options.subcategoryId));
    }

    if (options.status !== undefined) {
      conditions.push(eq(products.status, options.status));
    }

    const search = buildSearchCondition(options.search, SEARCHABLE_COLUMNS);

    if (search) {
      conditions.push(search);
    }

    return and(...conditions);
  }
}
