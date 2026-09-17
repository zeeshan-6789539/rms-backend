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
  leaseStatusBreakdown: { status: LeaseStatus; count: number }[];
  propertyStatusBreakdown: { status: boolean; count: number }[];
  paymentMethodBreakdown: { method: PaymentMethod; count: number; total: string }[];
  paymentsTrendRows: { month: string; total: string }[];
  recentPayments: {
    id: string;
    amountPaid: string;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    tenantName: string;
    propertyName: string;
  }[];
}
