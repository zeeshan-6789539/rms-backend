import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUrl, IsUUID, MaxLength } from 'class-validator';
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

  @ApiPropertyOptional({
    example: 'https://drive.google.com/file/d/abc123/view',
    description: 'Link to the signed lease document (Google Drive or any other storage)',
  })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'documentUrl must be a full http(s) link, e.g. https://drive.google.com/...' },
  )
  @MaxLength(2048, { message: 'documentUrl must be at most 2048 characters' })
  @IsOptional()
  documentUrl?: string;
}
