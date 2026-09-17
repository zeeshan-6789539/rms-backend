export interface ISkippedLease {
  leaseId: string;
  propertyName: string;
  tenantName: string;
  reason: 'no_rent_schedule' | 'already_generated';
}
