import { Inject, Injectable } from '@nestjs/common';
import { and, eq, type SQL } from 'drizzle-orm';
import { ChargeType } from '../../common/enums/charge-type.enum.js';
import { LeaseStatus } from '../../common/enums/lease-status.enum.js';
import { TransactionType } from '../../common/enums/transaction-type.enum.js';
import { withDatabaseErrors } from '../../common/utils/database-error.util.js';
import { buildSearchCondition } from '../../common/utils/query.util.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { IChargeRow, INewChargeRow } from '../../database/interfaces/i-charge-row.js';
import type { IDrizzleDb } from '../../database/interfaces/i-drizzle-db.js';
import {
  charges,
  leaseRentSchedules,
  leases,
  payments,
  properties,
  tenants,
} from '../../database/schema/index.js';
import type { ILedgerEntryRow } from './interfaces/i-ledger-entry-row.js';
import { CHARGE_CONSTRAINT_MESSAGES } from './ledger.constants.js';

const SEARCHABLE_COLUMNS = [properties.name, tenants.name];

export interface IActiveLeaseForBilling {
  leaseId: string;
  propertyId: string;
  tenantId: string;
  propertyName: string;
  tenantName: string;
  rentAmount: string | null;
}

@Injectable()
export class LedgerRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  async findChargesForStatement(
    companyId: string,
    leaseId: string | undefined,
    search: string | undefined,
  ): Promise<ILedgerEntryRow[]> {
    const where = this.buildStatementFilters(charges.companyId, charges.leaseId, companyId, leaseId, search);

    const rows = await this.db
      .select({
        id: charges.id,
        companyId: charges.companyId,
        propertyId: charges.propertyId,
        tenantId: charges.tenantId,
        leaseId: charges.leaseId,
        entryType: charges.chargeType,
        transactionType: charges.transactionType,
        amount: charges.amount,
        billingMonth: charges.billingMonth,
        dueDate: charges.dueDate,
        description: charges.description,
        createdAt: charges.createdAt,
        createdBy: charges.createdBy,
        propertyName: properties.name,
        tenantName: tenants.name,
      })
      .from(charges)
      .innerJoin(properties, eq(charges.propertyId, properties.id))
      .innerJoin(tenants, eq(charges.tenantId, tenants.id))
      .where(where);

    return rows.map((row) => ({ ...row, paymentId: null }));
  }

  async findPaymentsForStatement(
    companyId: string,
    leaseId: string | undefined,
    search: string | undefined,
  ): Promise<ILedgerEntryRow[]> {
    const where = this.buildStatementFilters(payments.companyId, payments.leaseId, companyId, leaseId, search);

    const rows = await this.db
      .select({
        id: payments.id,
        companyId: payments.companyId,
        propertyId: payments.propertyId,
        tenantId: payments.tenantId,
        leaseId: payments.leaseId,
        amount: payments.amountPaid,
        dueDate: payments.paymentDate,
        referenceNumber: payments.referenceNumber,
        paymentMethod: payments.paymentMethod,
        createdAt: payments.createdAt,
        createdBy: payments.createdBy,
        propertyName: properties.name,
        tenantName: tenants.name,
      })
      .from(payments)
      .innerJoin(properties, eq(payments.propertyId, properties.id))
      .innerJoin(tenants, eq(payments.tenantId, tenants.id))
      .where(where);

    return rows.map((row) => {
      const methodLabel = row.paymentMethod.replace(/_/g, ' ');

      return {
        id: row.id,
        companyId: row.companyId,
        propertyId: row.propertyId,
        tenantId: row.tenantId,
        leaseId: row.leaseId,
        paymentId: row.id,
        entryType: 'payment_received' as const,
        transactionType: TransactionType.CREDIT,
        amount: row.amount,
        billingMonth: null,
        dueDate: row.dueDate,
        description: row.referenceNumber
          ? `Payment received (${methodLabel}) – ref ${row.referenceNumber}`
          : `Payment received (${methodLabel})`,
        createdAt: row.createdAt,
        createdBy: row.createdBy,
        propertyName: row.propertyName,
        tenantName: row.tenantName,
      };
    });
  }

  async findChargeLeaseId(id: string, companyId: string): Promise<string | undefined> {
    const [row] = await this.db
      .select({ leaseId: charges.leaseId })
      .from(charges)
      .where(and(eq(charges.id, id), eq(charges.companyId, companyId)));

    return row?.leaseId;
  }

  async findPaymentLeaseId(id: string, companyId: string): Promise<string | undefined> {
    const [row] = await this.db
      .select({ leaseId: payments.leaseId })
      .from(payments)
      .where(and(eq(payments.id, id), eq(payments.companyId, companyId)));

    return row?.leaseId;
  }

  async createCharge(data: INewChargeRow): Promise<IChargeRow> {
    return withDatabaseErrors(async () => {
      const [row] = await this.db.insert(charges).values(data).returning();

      return row;
    }, CHARGE_CONSTRAINT_MESSAGES);
  }

  async findActiveLeasesForBilling(companyId: string): Promise<IActiveLeaseForBilling[]> {
    return this.db
      .select({
        leaseId: leases.id,
        propertyId: leases.propertyId,
        tenantId: leases.tenantId,
        propertyName: properties.name,
        tenantName: tenants.name,
        rentAmount: leaseRentSchedules.rentAmount,
      })
      .from(leases)
      .innerJoin(properties, eq(leases.propertyId, properties.id))
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .leftJoin(
        leaseRentSchedules,
        and(eq(leaseRentSchedules.leaseId, leases.id), eq(leaseRentSchedules.isCurrent, true)),
      )
      .where(and(eq(leases.companyId, companyId), eq(leases.status, LeaseStatus.ACTIVE)));
  }

  async findGeneratedLeaseIds(companyId: string, billingMonth: string): Promise<Set<string>> {
    const rows = await this.db
      .select({ leaseId: charges.leaseId })
      .from(charges)
      .where(
        and(
          eq(charges.companyId, companyId),
          eq(charges.chargeType, ChargeType.MONTHLY_RENT),
          eq(charges.billingMonth, billingMonth),
        ),
      );

    return new Set(rows.map((row) => row.leaseId));
  }

  async insertMonthlyRentCharges(rows: INewChargeRow[]): Promise<IChargeRow[]> {
    if (rows.length === 0) {
      return [];
    }

    // One transaction so a mid-batch failure doesn't leave some leases charged and others not
    return withDatabaseErrors(async () => {
      return this.db.transaction(async (tx) => {
        const inserted: IChargeRow[] = [];

        for (const row of rows) {
          const [entry] = await tx.insert(charges).values(row).returning();

          if (entry) {
            inserted.push(entry);
          }
        }

        return inserted;
      });
    }, CHARGE_CONSTRAINT_MESSAGES);
  }

  private buildStatementFilters(
    companyIdColumn: typeof charges.companyId | typeof payments.companyId,
    leaseIdColumn: typeof charges.leaseId | typeof payments.leaseId,
    companyId: string,
    leaseId: string | undefined,
    search: string | undefined,
  ): SQL {
    const conditions: SQL[] = [eq(companyIdColumn, companyId)];

    if (leaseId) {
      conditions.push(eq(leaseIdColumn, leaseId));
    }

    const searchCondition = buildSearchCondition(search, SEARCHABLE_COLUMNS);

    if (searchCondition) {
      conditions.push(searchCondition);
    }

    return and(...conditions) as SQL;
  }
}
