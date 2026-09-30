export interface ICreateLeaseData {
  companyId: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  advanceAmount: string;
  documentUrl: string | null;
  monthlyRent: string;
}
