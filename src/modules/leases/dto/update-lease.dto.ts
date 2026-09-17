import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { IsMoneyString } from '../../../common/decorators/is-money-string.decorator.js';

// Not PartialType(CreateLeaseDto) — propertyId/tenantId are set at creation and
// must never be reassigned on an existing lease (terminate + create a new one instead).
export class UpdateLeaseDto {
  @ApiPropertyOptional({ format: 'date', example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: '100000.00' })
  @IsMoneyString()
  @IsOptional()
  advanceAmount?: string;
}
