import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PropertyType } from '../../../common/enums/property-type.enum.js';

export class QueryPropertiesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Karachi' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsEnum(PropertyType, {
    message: `propertyType must be one of: ${Object.values(PropertyType).join(', ')}`,
  })
  @IsOptional()
  propertyType?: PropertyType;

  @ApiPropertyOptional({
    description: 'true returns active properties, false returns deactivated ones',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
