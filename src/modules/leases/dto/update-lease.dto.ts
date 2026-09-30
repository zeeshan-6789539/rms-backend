import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUrl, MaxLength } from 'class-validator';
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

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://drive.google.com/file/d/abc123/view',
    description: 'Send null to remove the document link',
  })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'documentUrl must be a full http(s) link, e.g. https://drive.google.com/...' },
  )
  @MaxLength(2048, { message: 'documentUrl must be at most 2048 characters' })
  @IsOptional()
  documentUrl?: string | null;
}
