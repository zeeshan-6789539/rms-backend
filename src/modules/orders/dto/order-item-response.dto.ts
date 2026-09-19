import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Null if the product no longer exists',
  })
  productName!: string | null;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: 150, description: 'Unit price at the time of order' })
  price!: number;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;
}
