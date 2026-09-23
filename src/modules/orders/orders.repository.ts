import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  lte,
  sql,
  type SQL,
} from 'drizzle-orm';
import { OrderStatus } from '../../common/enums/order-status.enum.js';
import { SortOrder } from '../../common/enums/sort-order.enum.js';
import { escapeLikePattern } from '../../common/utils/string.util.js';
import { withDatabaseErrors } from '../../common/utils/database-error.util.js';
import { getOffset } from '../../common/utils/pagination.util.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type {
  IDrizzleDb,
  IDrizzleTransaction,
} from '../../database/interfaces/i-drizzle-db.js';
import type {
  INewOrderItemRow,
  IOrderItemRow,
} from '../../database/interfaces/i-order-item-row.js';
import type {
  INewOrderRow,
  IOrderRow,
} from '../../database/interfaces/i-order-row.js';
import {
  orderItems,
  orders,
  products,
} from '../../database/schema/index.js';
import type { IFindOrdersOptions } from './interfaces/i-find-orders-options.js';
import type { IOrderListResult } from './interfaces/i-order-list-result.js';
import type { IOrderItemWithProductName } from './interfaces/i-order-with-items.js';
import type { IOrderWithItems } from './interfaces/i-order-with-items.js';
import { ORDER_CONSTRAINT_MESSAGES } from './orders.constants.js';

@Injectable()
export class OrdersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  // Lets the service orchestrate a multi-table transaction (orders +
  // order_items + a products.quantity decrement) without touching Drizzle itself.
  async runInTransaction<T>(
    fn: (tx: IDrizzleTransaction) => Promise<T>,
  ): Promise<T> {
    return withDatabaseErrors(
      () => this.db.transaction(fn),
      ORDER_CONSTRAINT_MESSAGES,
    );
  }

  async createOrder(
    tx: IDrizzleTransaction,
    data: INewOrderRow,
  ): Promise<IOrderRow> {
    const [row] = await tx.insert(orders).values(data).returning();

    return row;
  }

  async createOrderItems(
    tx: IDrizzleTransaction,
    items: INewOrderItemRow[],
  ): Promise<IOrderItemRow[]> {
    return tx.insert(orderItems).values(items).returning();
  }

  // Runs inside runInTransaction so it shares the transaction that restores
  // stock when the new status is CANCELLED — see orders.service.ts
  async updateStatusInTransaction(
    tx: IDrizzleTransaction,
    id: string,
    status: OrderStatus,
  ): Promise<IOrderRow | undefined> {
    const [row] = await tx
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    return row;
  }

  async findByIdWithItems(id: string): Promise<IOrderWithItems | undefined> {
    const [orderRow] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!orderRow) {
      return undefined;
    }

    const items = await this.db
      .select({ ...getTableColumns(orderItems), productName: products.name })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return { ...orderRow, items };
  }

  async findMany(options: IFindOrdersOptions): Promise<IOrderListResult> {
    const where = this.buildFilters(options);
    const direction = options.sortOrder === SortOrder.ASC ? asc : desc;

    const [orderRows, [total]] = await Promise.all([
      this.db
        .select()
        .from(orders)
        .where(where)
        .orderBy(direction(orders.createdAt), direction(orders.id))
        .limit(options.limit)
        .offset(getOffset(options.page, options.limit)),
      this.db.select({ value: count() }).from(orders).where(where),
    ]);

    if (orderRows.length === 0) {
      return { items: [], totalItems: total?.value ?? 0 };
    }

    const orderIds = orderRows.map((row) => row.id);
    const itemRows = await this.db
      .select({ ...getTableColumns(orderItems), productName: products.name })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = new Map<string, IOrderItemWithProductName[]>();

    for (const item of itemRows) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return {
      items: orderRows.map((row) => ({
        ...row,
        items: itemsByOrder.get(row.id) ?? [],
      })),
      totalItems: total?.value ?? 0,
    };
  }

  private buildFilters(options: IFindOrdersOptions): SQL | undefined {
    const conditions: SQL[] = [eq(orders.companyId, options.companyId)];

    if (options.status) {
      conditions.push(eq(orders.status, options.status));
    }

    if (options.from) {
      conditions.push(gte(orders.createdAt, options.from));
    }

    if (options.to) {
      conditions.push(lte(orders.createdAt, options.to));
    }

    const search = options.search?.trim();

    if (search) {
      const pattern = `%${escapeLikePattern(search)}%`;
      conditions.push(ilike(sql<string>`${orders.id}::text`, pattern));
    }

    return and(...conditions);
  }
}
