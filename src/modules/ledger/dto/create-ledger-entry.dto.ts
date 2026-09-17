import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { IsMoneyString } from '../../../common/decorators/is-money-string.decorator.js';
import { ChargeType } from '../../../common/enums/charge-type.enum.js';

// monthly_rent and rent_change are system-generated only (see POST /ledger/generate-monthly-rent
// and PATCH /leases/:id/rent) — a client can never post those two types directly.
const POSTABLE_CHARGE_TYPES = Object.values(ChargeType).filter(
  (type) => type !== ChargeType.MONTHLY_RENT && type !== ChargeType.RENT_CHANGE,
);

export class CreateLedgerEntryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: 'leaseId must be a valid UUID' })
  leaseId!: string;

  @ApiProperty({ enum: POSTABLE_CHARGE_TYPES })
  @IsEnum(POSTABLE_CHARGE_TYPES, {
    message: `entryType must be one of: ${POSTABLE_CHARGE_TYPES.join(', ')}`,
  })
  entryType!: Exclude<ChargeType, ChargeType.MONTHLY_RENT | ChargeType.RENT_CHANGE>;

  @ApiProperty({ example: '2500.00' })
  @IsMoneyString()
  amount!: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-04-05' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'March electricity bill' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;
}
