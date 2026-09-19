import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { OrderStatus } from '../../../common/enums/order-status.enum.js';

export class QueryOrdersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsEnum(OrderStatus, {
    message: `status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    format: 'date-time',
    description: 'Created-at range start (inclusive)',
  })
  @IsDateString(undefined, { message: 'from must be a valid ISO date' })
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    description: 'Created-at range end (inclusive)',
  })
  @IsDateString(undefined, { message: 'to must be a valid ISO date' })
  @IsOptional()
  to?: string;
}
