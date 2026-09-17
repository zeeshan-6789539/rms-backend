import { Injectable, NotFoundException } from '@nestjs/common';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { buildPaginatedResult } from '../../common/utils/pagination.util.js';
import { LeasesService } from '../leases/leases.service.js';
import type { CreatePaymentDto } from './dto/create-payment.dto.js';
import type { PaymentResponseDto } from './dto/payment-response.dto.js';
import type { QueryPaymentsDto } from './dto/query-payments.dto.js';
import { toPaymentResponse } from './mappers/payment.mapper.js';
import { PaymentsRepository } from './payments.repository.js';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly leasesService: LeasesService,
  ) {}

  async create(
    companyId: string,
    userId: string,
    dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const lease = await this.leasesService.findRowOrFail(companyId, dto.leaseId);

    const row = await this.paymentsRepository.create({
      companyId,
      propertyId: lease.propertyId,
      tenantId: lease.tenantId,
      leaseId: lease.id,
      amountPaid: dto.amountPaid,
      paymentDate: dto.paymentDate,
      paymentMethod: dto.paymentMethod,
      receiptNumber: dto.receiptNumber,
      referenceNumber: dto.referenceNumber,
      bankName: dto.bankName,
      chequeClearanceDate: dto.chequeClearanceDate,
      notes: dto.notes,
      createdBy: userId,
    });

    return this.findOne(companyId, row.id);
  }

  async findAll(
    companyId: string,
    query: QueryPaymentsDto,
  ): Promise<IPaginatedResult<PaymentResponseDto>> {
    const { items, totalItems } = await this.paymentsRepository.findMany({
      companyId,
      page: query.page,
      limit: query.limit,
      search: query.search,
      leaseId: query.leaseId,
      sortOrder: query.sortOrder,
    });

    return buildPaginatedResult(
      items.map(toPaymentResponse),
      totalItems,
      query.page,
      query.limit,
    );
  }

  async findOne(companyId: string, id: string): Promise<PaymentResponseDto> {
    const row = await this.paymentsRepository.findById(id, companyId);

    if (!row) {
      throw new NotFoundException(`No payment was found with id ${id}`);
    }

    return toPaymentResponse(row);
  }
}
