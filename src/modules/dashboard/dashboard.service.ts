import { Injectable } from '@nestjs/common';
import { DashboardTrendRange } from '../../common/enums/dashboard-trend-range.enum.js';
import { DashboardRepository } from './dashboard.repository.js';
import { DASHBOARD_TREND_RANGE_MONTHS } from './dashboard.constants.js';
import type { DashboardStatsResponseDto, DashboardTrendPointDto } from './dto/dashboard-stats-response.dto.js';

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const parseMonthKey = (key: string): Date => {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1);
};

const buildTrendSeries = (
  rows: { month: string; total: string }[],
  monthsCount: number,
  now: Date,
): DashboardTrendPointDto[] => {
  const trendByMonth = new Map(rows.map((row) => [row.month, row.total]));

  return Array.from({ length: monthsCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1 - index), 1);
    const key = monthKey(date);

    return { month: key, total: trendByMonth.get(key) ?? '0.00' };
  });
};

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getStats(
    companyId: string,
    trendRange: DashboardTrendRange,
  ): Promise<DashboardStatsResponseDto> {
    const raw = await this.dashboardRepository.getStats(companyId, trendRange);
    const now = new Date();

    const trendMonths = DASHBOARD_TREND_RANGE_MONTHS[trendRange];
    const paymentsTrend = trendMonths
      ? buildTrendSeries(raw.paymentsTrendRows, trendMonths, now)
      : this.buildAllTimeTrend(raw.paymentsTrendRows, now);

    return {
      totals: {
        tenants: raw.tenantsTotal,
        activeTenants: raw.activeTenantsTotal,
        properties: raw.propertiesTotal,
        activeLeases: raw.activeLeasesTotal,
        // At most one active lease per property (DB constraint), so active leases == occupied properties
        assignedProperties: raw.activeLeasesTotal,
        paymentsThisMonthCount: raw.paymentsThisMonthCount,
        paymentsThisMonthTotal: raw.paymentsThisMonthTotal,
        paymentsLastMonthTotal: raw.paymentsLastMonthTotal,
      },
      paymentsTrend,
      propertyStatusBreakdown: raw.propertyStatusBreakdown,
      recentPayments: raw.recentPayments,
      outstandingLeases: raw.outstandingLeases,
    };
  }

  private buildAllTimeTrend(
    rows: { month: string; total: string }[],
    now: Date,
  ): DashboardTrendPointDto[] {
    if (rows.length === 0) {
      return [];
    }

    const earliestMonth = rows.map((row) => row.month).sort()[0];
    const earliestDate = parseMonthKey(earliestMonth);
    const monthsCount =
      (now.getFullYear() - earliestDate.getFullYear()) * 12 +
      (now.getMonth() - earliestDate.getMonth()) +
      1;

    return buildTrendSeries(rows, monthsCount, now);
  }
}
