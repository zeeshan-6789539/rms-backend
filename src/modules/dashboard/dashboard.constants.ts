import { DashboardTrendRange } from '../../common/enums/dashboard-trend-range.enum.js';

export const DASHBOARD_RECENT_PAYMENTS_LIMIT = 5;
export const DASHBOARD_OUTSTANDING_LEASES_LIMIT = 5;

// 'all' has no fixed month count — undefined means "no lower bound" to callers
export const DASHBOARD_TREND_RANGE_MONTHS: Partial<Record<DashboardTrendRange, number>> = {
  [DashboardTrendRange.SIX_MONTHS]: 6,
  [DashboardTrendRange.ONE_YEAR]: 12,
};
