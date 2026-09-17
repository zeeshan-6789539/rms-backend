import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, type SQL } from 'drizzle-orm';
import { SortOrder } from '../../common/enums/sort-order.enum.js';
import { withDatabaseErrors } from '../../common/utils/database-error.util.js';
import { getOffset } from '../../common/utils/pagination.util.js';
import { buildSearchCondition } from '../../common/utils/query.util.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { IDrizzleDb } from '../../database/interfaces/i-drizzle-db.js';
import type {
  INewTenantRow,
  ITenantRow,
} from '../../database/interfaces/i-tenant-row.js';
import { tenants } from '../../database/schema/index.js';
import type { IFindTenantsOptions } from './interfaces/i-find-tenants-options.js';
import type { ITenantListResult } from './interfaces/i-tenant-list-result.js';
import { TENANT_CONSTRAINT_MESSAGES } from './tenants.constants.js';

const SEARCHABLE_COLUMNS = [tenants.name, tenants.email, tenants.phone];

@Injectable()
export class TenantsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  async findById(
    id: string,
    companyId: string,
  ): Promise<ITenantRow | undefined> {
    const [row] = await this.db
      .select()
      .from(tenants)
      .where(and(eq(tenants.id, id), eq(tenants.companyId, companyId)))
      .limit(1);

    return row;
  }

  async findMany(options: IFindTenantsOptions): Promise<ITenantListResult> {
    const where = this.buildFilters(options);
    const direction = options.sortOrder === SortOrder.ASC ? asc : desc;

    const [items, [total]] = await Promise.all([
      this.db
        .select()
        .from(tenants)
        .where(where)
        // id breaks ties so rows created in the same millisecond stay stable
        .orderBy(direction(tenants.createdAt), direction(tenants.id))
        .limit(options.limit)
        .offset(getOffset(options.page, options.limit)),
      this.db.select({ value: count() }).from(tenants).where(where),
    ]);

    return { items, totalItems: total?.value ?? 0 };
  }

  async create(data: INewTenantRow): Promise<ITenantRow> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db.insert(tenants).values(data).returning();

      return row;
    }, TENANT_CONSTRAINT_MESSAGES);
  }

  async update(
    id: string,
    companyId: string,
    data: Partial<INewTenantRow>,
  ): Promise<ITenantRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(tenants)
        .set(data)
        .where(and(eq(tenants.id, id), eq(tenants.companyId, companyId)))
        .returning();

      return row;
    }, TENANT_CONSTRAINT_MESSAGES);
  }

  // "Delete" is a status flip — the row is kept for audit and referential integrity
  async setStatus(
    id: string,
    companyId: string,
    status: boolean,
  ): Promise<ITenantRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(tenants)
        .set({ status })
        .where(and(eq(tenants.id, id), eq(tenants.companyId, companyId)))
        .returning();

      return row;
    }, TENANT_CONSTRAINT_MESSAGES);
  }

  private buildFilters(options: IFindTenantsOptions): SQL | undefined {
    const conditions: SQL[] = [eq(tenants.companyId, options.companyId)];

    if (options.status !== undefined) {
      conditions.push(eq(tenants.status, options.status));
    }

    const search = buildSearchCondition(options.search, SEARCHABLE_COLUMNS);

    if (search) {
      conditions.push(search);
    }

    return and(...conditions);
  }
}
