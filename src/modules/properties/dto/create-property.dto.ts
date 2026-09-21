import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Sunset Apartments' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @MaxLength(500)
  addressLine1!: string;

  @ApiProperty({ example: 'Karachi' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({
    default: true,
    description: 'true is active, false is deactivated',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
