import type { LeaseStatus } from '../../../common/enums/lease-status.enum.js';
import type { PaymentMethod } from '../../../common/enums/payment-method.enum.js';

export interface IRawDashboardStats {
  tenantsTotal: number;
  activeTenantsTotal: number;
  propertiesTotal: number;
  activeLeasesTotal: number;
  paymentsThisMonthCount: number;
  paymentsThisMonthTotal: string;
  paymentsLastMonthTotal: string;
  propertyStatusBreakdown: { status: boolean; count: number }[];
  paymentsTrendRows: { month: string; total: string }[];
  recentPayments: {
    id: string;
    amountPaid: string;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    tenantName: string;
    propertyName: string;
  }[];
  outstandingLeases: {
    id: string;
    propertyName: string;
    tenantName: string;
    status: LeaseStatus;
    outstandingBalance: string;
  }[];
}
