import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CheckoutOrderItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: 'productId must be a valid UUID' })
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    example: 150,
    description:
      'Price you last saw for this product — used only to detect stale pricing',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;
}

export class CheckoutOrderDto {
  @ApiProperty({ type: [CheckoutOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one item is required to checkout' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutOrderItemDto)
  items!: CheckoutOrderItemDto[];
}
