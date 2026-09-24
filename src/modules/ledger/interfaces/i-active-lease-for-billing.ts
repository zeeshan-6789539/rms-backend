export interface IActiveLeaseForBilling {
  leaseId: string;
  companyId: string;
  propertyId: string;
  tenantId: string;
  propertyName: string;
  tenantName: string;
  tenantEmail: string | null;
  rentAmount: string | null;
  invoiceMailSend: boolean;
}
