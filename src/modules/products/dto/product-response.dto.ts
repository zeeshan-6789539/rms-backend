import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Coca-Cola 500ml' })
  name!: string;

  @ApiProperty({ description: 'Auto-incrementing human-friendly identifier' })
  sku!: number;

  @ApiProperty({ example: 150 })
  sellPrice!: number;

  @ApiProperty({ example: 100 })
  purchasePrice!: number;

  @ApiProperty({ example: 50 })
  quantity!: number;

  @ApiProperty({ example: 50, description: 'Alias for quantity' })
  remainingStock!: number;

  @ApiProperty({ format: 'uuid' })
  subcategoryId!: string;

  @ApiProperty({ format: 'uuid' })
  companyId!: string;

  @ApiProperty({ format: 'uuid' })
  createdByUserId!: string;

  @ApiProperty({ description: 'true is active, false is deactivated' })
  status!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
