import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository.js';
import { DASHBOARD_TREND_MONTHS } from './dashboard.constants.js';
import type { DashboardStatsResponseDto, DashboardTrendPointDto } from './dto/dashboard-stats-response.dto.js';

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getStats(companyId: string): Promise<DashboardStatsResponseDto> {
    const raw = await this.dashboardRepository.getStats(companyId);
    const now = new Date();
    const trendByMonth = new Map(raw.paymentsTrendRows.map((row) => [row.month, row.total]));

    const paymentsTrend: DashboardTrendPointDto[] = Array.from(
      { length: DASHBOARD_TREND_MONTHS },
      (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (DASHBOARD_TREND_MONTHS - 1 - index), 1);
        const key = monthKey(date);

        return { month: key, total: trendByMonth.get(key) ?? '0.00' };
      },
    );

    return {
      totals: {
        tenants: raw.tenantsTotal,
        activeTenants: raw.activeTenantsTotal,
        properties: raw.propertiesTotal,
        activeLeases: raw.activeLeasesTotal,
        paymentsThisMonthCount: raw.paymentsThisMonthCount,
        paymentsThisMonthTotal: raw.paymentsThisMonthTotal,
        paymentsLastMonthTotal: raw.paymentsLastMonthTotal,
      },
      paymentsTrend,
      leaseStatusBreakdown: raw.leaseStatusBreakdown,
      propertyStatusBreakdown: raw.propertyStatusBreakdown,
      paymentMethodBreakdown: raw.paymentMethodBreakdown,
      recentPayments: raw.recentPayments,
    };
  }
}
