import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Ali Raza' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ format: 'email', example: 'ali.raza@example.com' })
  @IsEmail(undefined, { message: 'email must be a valid email address' })
  @MaxLength(255)
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '03296789539' })
  @IsPhoneNumber('PK', {
    message: 'phone must be a valid Pakistani number, e.g. 03296789539',
  })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'true is active, false is deactivated',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
