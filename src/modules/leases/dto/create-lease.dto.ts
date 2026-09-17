import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { IsMoneyString } from '../../../common/decorators/is-money-string.decorator.js';

export class CreateLeaseDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: 'propertyId must be a valid UUID' })
  propertyId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: 'tenantId must be a valid UUID' })
  tenantId!: string;

  @ApiProperty({ format: 'date', example: '2026-01-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ format: 'date', example: '2026-12-31' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: '50000.00', description: 'Monthly rent, seeds the first rent schedule' })
  @IsMoneyString()
  monthlyRent!: string;

  @ApiPropertyOptional({ example: '100000.00', default: '0.00' })
  @IsMoneyString()
  @IsOptional()
  advanceAmount?: string;
}
