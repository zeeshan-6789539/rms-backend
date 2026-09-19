import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductPriceHistoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ example: 150 })
  sellPrice!: number;

  @ApiProperty({ example: 100 })
  purchasePrice!: number;

  @ApiProperty({ format: 'date-time' })
  effectiveFrom!: Date;

  @ApiPropertyOptional({
    format: 'date-time',
    nullable: true,
    description: 'Null means this is the currently active price',
  })
  effectiveTo!: Date | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;
}
