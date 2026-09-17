import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum.js';

export class CreateUserDto {
  @ApiProperty({
    example: 'aisha.khan',
    description:
      'Unique login identifier. Letters, digits, dot, dash and underscore.',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username may only contain letters, digits, dots, dashes and underscores',
  })
  username!: string;

  @ApiProperty({
    format: 'email',
    example: 'manager@rms.local',
    description: 'Contact address — not unique, several users may share one.',
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Aisha' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Khan' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ example: '03296789539' })
  @IsPhoneNumber('PK', {
    message: 'phone must be a valid Pakistani number, e.g. 03296789539',
  })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Owning company. Must be omitted for super_admin, who is platform-level.',
  })
  @IsUUID(undefined, { message: 'companyId must be a valid UUID' })
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.STAFF })
  @IsEnum(UserRole, {
    message: `role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    default: true,
    description: 'true is active, false is deactivated',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
