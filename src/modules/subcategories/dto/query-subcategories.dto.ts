import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class QuerySubcategoriesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filter by parent category',
  })
  @IsUUID(undefined, { message: 'categoryId must be a valid UUID' })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description:
      'true returns active subcategories, false returns deactivated ones',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
