export interface IActiveLeaseForBilling {
  leaseId: string;
  companyId: string;
  propertyId: string;
  tenantId: string;
  propertyNumber: string;
  propertyName: string;
  tenantName: string;
  tenantEmail: string | null;
  rentAmount: string | null;
  rentDueDay: number;
  invoiceMailSend: boolean;
}
