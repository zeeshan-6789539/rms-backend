import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateSubcategoryDto {
  @ApiProperty({ example: 'Soft Drinks' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: 'categoryId must be a valid UUID' })
  categoryId!: string;
}
