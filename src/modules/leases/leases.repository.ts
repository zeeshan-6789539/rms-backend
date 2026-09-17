import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, sql, type SQL } from 'drizzle-orm';
import { ChargeType } from '../../common/enums/charge-type.enum.js';
import { LeaseStatus } from '../../common/enums/lease-status.enum.js';
import { SortOrder } from '../../common/enums/sort-order.enum.js';
import { TransactionType } from '../../common/enums/transaction-type.enum.js';
import { withDatabaseErrors } from '../../common/utils/database-error.util.js';
import { getOffset } from '../../common/utils/pagination.util.js';
import { buildSearchCondition } from '../../common/utils/query.util.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { IDrizzleDb } from '../../database/interfaces/i-drizzle-db.js';
import type { ILeaseRentScheduleRow } from '../../database/interfaces/i-lease-rent-schedule-row.js';
import type { ILeaseRow } from '../../database/interfaces/i-lease-row.js';
import {
  charges,
  leaseRentSchedules,
  leases,
  payments,
  properties,
  tenants,
} from '../../database/schema/index.js';
import type { ICreateLeaseData } from './interfaces/i-create-lease-data.js';
import type { IFindLeasesOptions } from './interfaces/i-find-leases-options.js';
import type { ILeaseListResult } from './interfaces/i-lease-list-result.js';
import { LEASE_CONSTRAINT_MESSAGES } from './leases.constants.js';

const SEARCHABLE_COLUMNS = [properties.name, tenants.name];

// Replaces the prototype's trigger-maintained leases.current_balance column —
// this repo has no migration files, so the balance is computed at read time instead.
const OUTSTANDING_BALANCE_SQL = sql<string>`(
  COALESCE((
    SELECT SUM(CASE WHEN ${charges.transactionType} = 'debit' THEN ${charges.amount} ELSE -${charges.amount} END)
    FROM ${charges}
    WHERE ${charges.leaseId} = ${leases.id}
  ), 0)
  -
  COALESCE((SELECT SUM(${payments.amountPaid}) FROM ${payments} WHERE ${payments.leaseId} = ${leases.id}), 0)
)`;

interface IUpdateRentParams {
  companyId: string;
  leaseId: string;
  propertyId: string;
  tenantId: string;
  currentScheduleId?: string;
  rentAmount: string;
  effectiveFrom: string;
  notes?: string;
  description: string;
  createdBy: string;
}

@Injectable()
export class LeasesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  private selection() {
    return {
      id: leases.id,
      companyId: leases.companyId,
      propertyId: leases.propertyId,
      tenantId: leases.tenantId,
      propertyName: properties.name,
      tenantName: tenants.name,
      status: leases.status,
      startDate: leases.startDate,
      endDate: leases.endDate,
      advanceAmount: leases.advanceAmount,
      currentRent: leaseRentSchedules.rentAmount,
      outstandingBalance: OUTSTANDING_BALANCE_SQL,
      createdAt: leases.createdAt,
      updatedAt: leases.updatedAt,
    };
  }

  private baseQuery() {
    return this.db
      .select(this.selection())
      .from(leases)
      .innerJoin(properties, eq(leases.propertyId, properties.id))
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .leftJoin(
        leaseRentSchedules,
        and(
          eq(leaseRentSchedules.leaseId, leases.id),
          eq(leaseRentSchedules.isCurrent, true),
        ),
      );
  }

  async findById(id: string, companyId: string) {
    const [row] = await this.baseQuery().where(
      and(eq(leases.id, id), eq(leases.companyId, companyId)),
    );

    return row;
  }

  async findMany(options: IFindLeasesOptions): Promise<ILeaseListResult> {
    const where = this.buildFilters(options);
    const direction = options.sortOrder === SortOrder.ASC ? asc : desc;

    const [items, [total]] = await Promise.all([
      this.baseQuery()
        .where(where)
        // id breaks ties so rows created in the same millisecond stay stable
        .orderBy(direction(leases.createdAt), direction(leases.id))
        .limit(options.limit)
        .offset(getOffset(options.page, options.limit)),
      this.db
        .select({ value: count() })
        .from(leases)
        .innerJoin(properties, eq(leases.propertyId, properties.id))
        .innerJoin(tenants, eq(leases.tenantId, tenants.id))
        .where(where),
    ]);

    return { items, totalItems: total?.value ?? 0 };
  }

  async findActiveLeaseIdByProperty(
    companyId: string,
    propertyId: string,
  ): Promise<string | undefined> {
    const [row] = await this.db
      .select({ id: leases.id })
      .from(leases)
      .where(
        and(
          eq(leases.propertyId, propertyId),
          eq(leases.companyId, companyId),
          eq(leases.status, LeaseStatus.ACTIVE),
        ),
      )
      .limit(1);

    return row?.id;
  }

  async findCurrentRentSchedule(
    leaseId: string,
  ): Promise<ILeaseRentScheduleRow | undefined> {
    const [row] = await this.db
      .select()
      .from(leaseRentSchedules)
      .where(
        and(
          eq(leaseRentSchedules.leaseId, leaseId),
          eq(leaseRentSchedules.isCurrent, true),
        ),
      )
      .limit(1);

    return row;
  }

  async createWithRentSchedule(data: ICreateLeaseData): Promise<ILeaseRow> {
    return withDatabaseErrors(async () => {
      return this.db.transaction(async (tx) => {
        const [lease] = await tx
          .insert(leases)
          .values({
            companyId: data.companyId,
            propertyId: data.propertyId,
            tenantId: data.tenantId,
            startDate: data.startDate,
            endDate: data.endDate,
            advanceAmount: data.advanceAmount,
          })
          .returning();

        if (!lease) {
          throw new Error('Failed to create lease');
        }

        await tx.insert(leaseRentSchedules).values({
          companyId: data.companyId,
          leaseId: lease.id,
          rentAmount: data.monthlyRent,
          effectiveFrom: data.startDate,
          isCurrent: true,
        });

        return lease;
      });
    }, LEASE_CONSTRAINT_MESSAGES);
  }

  async update(
    id: string,
    companyId: string,
    data: { startDate?: string; endDate?: string; advanceAmount?: string; updatedAt: Date },
  ): Promise<ILeaseRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(leases)
        .set(data)
        .where(and(eq(leases.id, id), eq(leases.companyId, companyId)))
        .returning();

      return row;
    }, LEASE_CONSTRAINT_MESSAGES);
  }

  async updateStatus(
    id: string,
    companyId: string,
    status: LeaseStatus,
  ): Promise<ILeaseRow | undefined> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db
        .update(leases)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(leases.id, id), eq(leases.companyId, companyId)))
        .returning();

      return row;
    }, LEASE_CONSTRAINT_MESSAGES);
  }

  // Closes the current rent schedule and opens a new one, plus a zero-amount
  // "rent_change" audit entry directly on the shared charges table — see
  // LeasesService.updateRent for why this repository writes to that table.
  async updateRentWithChargeEntry(params: IUpdateRentParams): Promise<void> {
    await withDatabaseErrors(async () => {
      await this.db.transaction(async (tx) => {
        if (params.currentScheduleId) {
          await tx
            .update(leaseRentSchedules)
            .set({ effectiveTo: params.effectiveFrom, isCurrent: false })
            .where(eq(leaseRentSchedules.id, params.currentScheduleId));
        }

        await tx.insert(leaseRentSchedules).values({
          companyId: params.companyId,
          leaseId: params.leaseId,
          rentAmount: params.rentAmount,
          effectiveFrom: params.effectiveFrom,
          notes: params.notes,
          isCurrent: true,
        });

        // amount is 0.00 so the outstanding-balance aggregate is untouched by this insert
        await tx.insert(charges).values({
          companyId: params.companyId,
          propertyId: params.propertyId,
          tenantId: params.tenantId,
          leaseId: params.leaseId,
          chargeType: ChargeType.RENT_CHANGE,
          transactionType: TransactionType.DEBIT,
          amount: '0.00',
          dueDate: params.effectiveFrom,
          description: params.description,
          createdBy: params.createdBy,
        });
      });
    }, LEASE_CONSTRAINT_MESSAGES);
  }

  private buildFilters(options: IFindLeasesOptions): SQL | undefined {
    const conditions: SQL[] = [eq(leases.companyId, options.companyId)];

    if (options.propertyId) {
      conditions.push(eq(leases.propertyId, options.propertyId));
    }

    if (options.tenantId) {
      conditions.push(eq(leases.tenantId, options.tenantId));
    }

    if (options.status) {
      conditions.push(eq(leases.status, options.status));
    }

    const search = buildSearchCondition(options.search, SEARCHABLE_COLUMNS);

    if (search) {
      conditions.push(search);
    }

    return and(...conditions);
  }
}
