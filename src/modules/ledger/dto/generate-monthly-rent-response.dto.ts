import { ApiProperty } from '@nestjs/swagger';
import { LedgerEntryResponseDto } from './ledger-entry-response.dto.js';

export class SkippedLeaseDto {
  @ApiProperty({ format: 'uuid' })
  leaseId!: string;

  @ApiProperty({ example: 'Sunset Apartments' })
  propertyName!: string;

  @ApiProperty({ example: 'Ali Raza' })
  tenantName!: string;

  @ApiProperty({ enum: ['no_rent_schedule', 'already_generated'] })
  reason!: 'no_rent_schedule' | 'already_generated';
}

export class GenerateMonthlyRentResponseDto {
  @ApiProperty({ format: 'date', example: '2026-04-01' })
  billingMonth!: string;

  @ApiProperty({ type: [LedgerEntryResponseDto] })
  generated!: LedgerEntryResponseDto[];

  @ApiProperty({ type: [SkippedLeaseDto] })
  skipped!: SkippedLeaseDto[];
}
