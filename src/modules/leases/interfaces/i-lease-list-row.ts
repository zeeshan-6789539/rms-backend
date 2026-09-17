import type { LeaseStatus } from '../../../common/enums/lease-status.enum.js';

// The joined shape leases are always read in: lease + property/tenant names +
// current rent + a query-time-computed outstanding balance (see leases.repository.ts)
export interface ILeaseListRow {
  id: string;
  companyId: string;
  propertyId: string;
  tenantId: string;
  propertyName: string;
  tenantName: string;
  status: LeaseStatus;
  startDate: string;
  endDate: string;
  advanceAmount: string;
  currentRent: string | null;
  outstandingBalance: string;
  createdAt: Date;
  updatedAt: Date;
}
