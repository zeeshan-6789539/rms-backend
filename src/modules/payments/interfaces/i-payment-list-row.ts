import type { PaymentMethod } from '../../../common/enums/payment-method.enum.js';

export interface IPaymentListRow {
  id: string;
  companyId: string;
  propertyId: string;
  tenantId: string;
  leaseId: string;
  propertyName: string;
  tenantName: string;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receiptNumber: string | null;
  referenceNumber: string | null;
  bankName: string | null;
  chequeClearanceDate: string | null;
  notes: string | null;
  status: boolean;
  createdAt: Date;
  createdBy: string | null;
}
