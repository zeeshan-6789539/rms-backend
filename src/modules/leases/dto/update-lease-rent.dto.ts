import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsMoneyString } from '../../../common/decorators/is-money-string.decorator.js';

export class UpdateLeaseRentDto {
  @ApiProperty({ example: '55000.00' })
  @IsMoneyString()
  rentAmount!: string;

  @ApiProperty({ format: 'date', example: '2026-04-01' })
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({ example: 'Annual increase' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}
