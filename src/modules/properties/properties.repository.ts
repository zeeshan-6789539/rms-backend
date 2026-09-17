import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, type SQL } from 'drizzle-orm';
import { SortOrder } from '../../common/enums/sort-order.enum.js';
import { withDatabaseErrors } from '../../common/utils/database-error.util.js';
import { getOffset } from '../../common/utils/pagination.util.js';
import { buildSearchCondition } from '../../common/utils/query.util.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { IDrizzleDb } from '../../database/interfaces/i-drizzle-db.js';
import type {
  INewPropertyRow,
  IPropertyRow,
} from '../../database/interfaces/i-property-row.js';
import { properties } from '../../database/schema/index.js';
import { PROPERTY_CONSTRAINT_MESSAGES } from './properties.constants.js';
import type { IFindPropertiesOptions } from './interfaces/i-find-properties-options.js';
import type { IPropertyListResult } from './interfaces/i-property-list-result.js';

const SEARCHABLE_COLUMNS = [properties.name, properties.city];

@Injectable()
export class PropertiesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  async findById(
    id: string,
    companyId: string,
  ): Promise<IPropertyRow | undefined> {
    const [row] = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.companyId, companyId)))
      .limit(1);

    return row;
  }

  async findMany(options: IFindPropertiesOptions): Promise<IPropertyListResult> {
    const where = this.buildFilters(options);
    const direction = options.sortOrder === SortOrder.ASC ? asc : desc;

    const [items, [total]] = await Promise.all([
      this.db
        .select()
        .from(properties)
        .where(where)
        // id breaks ties so rows created in the same millisecond stay stable
        .orderBy(direction(properties.createdAt), direction(properties.id))
        .limit(options.limit)
        .offset(getOffset(options.page, options.limit)),
      this.db.select({ value: count() }).from(properties).where(where),
    ]);

    return { items, totalItems: total?.value ?? 0 };
  }

  async create(data: INewPropertyRow): Promise<IPropertyRow> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db.insert(properties).values(data).returning();

      return row;
    }, PROPERTY_CONSTRAINT_MESSAGES);
  }

  async update(
    id: string,
    companyId: string,
    data: Partial<INewPropertyRow>,
  ): Promise<IPropertyRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(properties)
        .set(data)
        .where(and(eq(properties.id, id), eq(properties.companyId, companyId)))
        .returning();

      return row;
    }, PROPERTY_CONSTRAINT_MESSAGES);
  }

  // "Delete" is a status flip — the row is kept for audit and referential integrity
  async setStatus(
    id: string,
    companyId: string,
    status: boolean,
  ): Promise<IPropertyRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(properties)
        .set({ status })
        .where(and(eq(properties.id, id), eq(properties.companyId, companyId)))
        .returning();

      return row;
    }, PROPERTY_CONSTRAINT_MESSAGES);
  }

  private buildFilters(options: IFindPropertiesOptions): SQL | undefined {
    const conditions: SQL[] = [eq(properties.companyId, options.companyId)];

    if (options.city) {
      conditions.push(eq(properties.city, options.city));
    }

    if (options.status !== undefined) {
      conditions.push(eq(properties.status, options.status));
    }

    const search = buildSearchCondition(options.search, SEARCHABLE_COLUMNS);

    if (search) {
      conditions.push(search);
    }

    return and(...conditions);
  }
}
