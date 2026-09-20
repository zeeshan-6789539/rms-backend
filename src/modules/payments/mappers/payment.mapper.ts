import type { IPaymentListRow } from '../interfaces/i-payment-list-row.js';
import type { PaymentResponseDto } from '../dto/payment-response.dto.js';

export const toPaymentResponse = (row: IPaymentListRow): PaymentResponseDto => ({
  id: row.id,
  companyId: row.companyId,
  propertyId: row.propertyId,
  tenantId: row.tenantId,
  leaseId: row.leaseId,
  propertyName: row.propertyName,
  tenantName: row.tenantName,
  amountPaid: row.amountPaid,
  paymentDate: row.paymentDate,
  paymentMethod: row.paymentMethod,
  receiptNumber: row.receiptNumber,
  referenceNumber: row.referenceNumber,
  bankName: row.bankName,
  chequeClearanceDate: row.chequeClearanceDate,
  notes: row.notes,
  status: row.status,
  createdAt: row.createdAt,
  createdBy: row.createdBy,
});
