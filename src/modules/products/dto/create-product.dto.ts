import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Coca-Cola 500ml' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 150, description: 'Sell price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sellPrice!: number;

  @ApiProperty({ example: 100, description: 'Purchase (cost) price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchasePrice!: number;

  @ApiPropertyOptional({ example: 50, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: 'subcategoryId must be a valid UUID' })
  subcategoryId!: string;
}
