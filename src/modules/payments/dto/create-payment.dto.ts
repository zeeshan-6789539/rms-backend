import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { IsMoneyString } from '../../../common/decorators/is-money-string.decorator.js';
import { PaymentMethod } from '../../../common/enums/payment-method.enum.js';

export class CreatePaymentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: 'leaseId must be a valid UUID' })
  leaseId!: string;

  @ApiProperty({ example: '50000.00' })
  @IsMoneyString()
  amountPaid!: string;

  @ApiProperty({ format: 'date', example: '2026-04-05' })
  @IsDateString()
  paymentDate!: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod, {
    message: `paymentMethod must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ example: 'RCPT-1024' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  receiptNumber?: string;

  @ApiPropertyOptional({ example: 'TXN-88213' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({ example: 'HBL' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-04-07' })
  @IsDateString()
  @IsOptional()
  chequeClearanceDate?: string;

  @ApiPropertyOptional({ example: 'April rent, paid in cash' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}
