import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { LeaseStatus } from '../../../common/enums/lease-status.enum.js';

export class QueryLeasesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID(undefined, { message: 'propertyId must be a valid UUID' })
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID(undefined, { message: 'tenantId must be a valid UUID' })
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ enum: LeaseStatus })
  @IsEnum(LeaseStatus, {
    message: `status must be one of: ${Object.values(LeaseStatus).join(', ')}`,
  })
  @IsOptional()
  status?: LeaseStatus;
}
