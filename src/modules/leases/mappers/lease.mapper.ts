import type { ILeaseListRow } from '../interfaces/i-lease-list-row.js';
import type { LeaseResponseDto } from '../dto/lease-response.dto.js';

export const toLeaseResponse = (row: ILeaseListRow): LeaseResponseDto => ({
  id: row.id,
  companyId: row.companyId,
  propertyId: row.propertyId,
  tenantId: row.tenantId,
  propertyName: row.propertyName,
  tenantName: row.tenantName,
  status: row.status,
  startDate: row.startDate,
  endDate: row.endDate,
  advanceAmount: row.advanceAmount,
  currentRent: row.currentRent,
  outstandingBalance: row.outstandingBalance,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
