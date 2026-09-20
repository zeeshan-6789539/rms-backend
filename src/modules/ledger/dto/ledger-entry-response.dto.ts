import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChargeType } from '../../../common/enums/charge-type.enum.js';
import { TransactionType } from '../../../common/enums/transaction-type.enum.js';

export class LedgerEntryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  companyId!: string;

  @ApiProperty({ format: 'uuid' })
  propertyId!: string;

  @ApiProperty({ format: 'uuid' })
  tenantId!: string;

  @ApiProperty({ format: 'uuid' })
  leaseId!: string;

  @ApiProperty({ example: 'Sunset Apartments' })
  propertyName!: string;

  @ApiProperty({ example: 'Ali Raza' })
  tenantName!: string;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  paymentId!: string | null;

  @ApiProperty({ enum: [...Object.values(ChargeType), 'payment_received'] })
  entryType!: ChargeType | 'payment_received';

  @ApiProperty({ enum: TransactionType })
  transactionType!: TransactionType;

  @ApiProperty({ example: '2500.00' })
  amount!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '22500.00',
    description: 'Null only on entries returned from generate-monthly-rent, to avoid an N+1 recompute per lease',
  })
  runningBalance!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'date' })
  billingMonth!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'date' })
  dueDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({
    example: true,
    description:
      'true is active, false is deactivated. Deactivated entries stay visible in the ledger but are excluded from running-balance calculations.',
  })
  status!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  createdBy!: string | null;
}
