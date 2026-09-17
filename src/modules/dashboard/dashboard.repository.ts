import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { LeaseStatus } from '../../common/enums/lease-status.enum.js';
import { DRIZZLE } from '../../database/database.constants.js';
import type { IDrizzleDb } from '../../database/interfaces/i-drizzle-db.js';
import { leases, payments, properties, tenants } from '../../database/schema/index.js';
import { DASHBOARD_RECENT_PAYMENTS_LIMIT, DASHBOARD_TREND_MONTHS } from './dashboard.constants.js';
import type { IRawDashboardStats } from './interfaces/i-raw-dashboard-stats.js';

const toDateString = (date: Date): string => date.toISOString().slice(0, 10);

@Injectable()
export class DashboardRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  async getStats(companyId: string): Promise<IRawDashboardStats> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const trendStart = new Date(now.getFullYear(), now.getMonth() - (DASHBOARD_TREND_MONTHS - 1), 1);

    const [
      tenantsTotalRows,
      activeTenantsTotalRows,
      propertiesTotalRows,
      leaseStatusBreakdown,
      propertyStatusBreakdown,
      thisMonthRows,
      lastMonthRows,
      paymentMethodBreakdown,
      paymentsTrendRows,
      recentPayments,
    ] = await Promise.all([
      this.db.select({ total: count() }).from(tenants).where(eq(tenants.companyId, companyId)),
      this.db
        .select({ total: count() })
        .from(tenants)
        .where(and(eq(tenants.companyId, companyId), eq(tenants.status, true))),
      this.db.select({ total: count() }).from(properties).where(eq(properties.companyId, companyId)),
      this.db
        .select({ status: leases.status, count: count() })
        .from(leases)
        .where(eq(leases.companyId, companyId))
        .groupBy(leases.status),
      this.db
        .select({ status: properties.status, count: count() })
        .from(properties)
        .where(eq(properties.companyId, companyId))
        .groupBy(properties.status),
      this.db
        .select({ count: count(), total: sql<string>`coalesce(sum(${payments.amountPaid}), 0)` })
        .from(payments)
        .where(and(eq(payments.companyId, companyId), gte(payments.paymentDate, toDateString(monthStart)))),
      this.db
        .select({ total: sql<string>`coalesce(sum(${payments.amountPaid}), 0)` })
        .from(payments)
        .where(
          and(
            eq(payments.companyId, companyId),
            gte(payments.paymentDate, toDateString(lastMonthStart)),
            lt(payments.paymentDate, toDateString(monthStart)),
          ),
        ),
      this.db
        .select({
          method: payments.paymentMethod,
          count: count(),
          total: sql<string>`coalesce(sum(${payments.amountPaid}), 0)`,
        })
        .from(payments)
        .where(eq(payments.companyId, companyId))
        .groupBy(payments.paymentMethod),
      this.db
        .select({
          month: sql<string>`to_char(${payments.paymentDate}, 'YYYY-MM')`,
          total: sql<string>`coalesce(sum(${payments.amountPaid}), 0)`,
        })
        .from(payments)
        .where(and(eq(payments.companyId, companyId), gte(payments.paymentDate, toDateString(trendStart))))
        .groupBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`),
      this.db
        .select({
          id: payments.id,
          amountPaid: payments.amountPaid,
          paymentDate: payments.paymentDate,
          paymentMethod: payments.paymentMethod,
          tenantName: tenants.name,
          propertyName: properties.name,
        })
        .from(payments)
        .innerJoin(tenants, eq(payments.tenantId, tenants.id))
        .innerJoin(properties, eq(payments.propertyId, properties.id))
        .where(eq(payments.companyId, companyId))
        .orderBy(desc(payments.paymentDate), desc(payments.createdAt))
        .limit(DASHBOARD_RECENT_PAYMENTS_LIMIT),
    ]);

    const activeLeasesTotal =
      leaseStatusBreakdown.find((row) => row.status === LeaseStatus.ACTIVE)?.count ?? 0;

    return {
      tenantsTotal: tenantsTotalRows[0]?.total ?? 0,
      activeTenantsTotal: activeTenantsTotalRows[0]?.total ?? 0,
      propertiesTotal: propertiesTotalRows[0]?.total ?? 0,
      activeLeasesTotal,
      paymentsThisMonthCount: thisMonthRows[0]?.count ?? 0,
      paymentsThisMonthTotal: thisMonthRows[0]?.total ?? '0.00',
      paymentsLastMonthTotal: lastMonthRows[0]?.total ?? '0.00',
      leaseStatusBreakdown,
      propertyStatusBreakdown,
      paymentMethodBreakdown,
      paymentsTrendRows,
      recentPayments,
    };
  }
}
