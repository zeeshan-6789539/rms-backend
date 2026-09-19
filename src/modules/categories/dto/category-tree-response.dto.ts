import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto.js';

export class SubcategoryTreeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Soft Drinks' })
  name!: string;

  @ApiProperty({ format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ description: 'true is active, false is deactivated' })
  status!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Number of active products in this subcategory',
  })
  productCount!: number;
}

export class CategoryTreeResponseDto extends CategoryResponseDto {
  @ApiProperty({ description: 'Sum of productCount across all subcategories' })
  productCount!: number;

  @ApiProperty({ type: [SubcategoryTreeResponseDto] })
  subcategories!: SubcategoryTreeResponseDto[];
}
