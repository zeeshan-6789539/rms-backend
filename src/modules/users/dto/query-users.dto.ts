import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { UserRole } from '../../../common/enums/user-role.enum.js';

export class QueryUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID(undefined, { message: 'companyId must be a valid UUID' })
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole, {
    message: `role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'true returns active users, false returns deactivated ones',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
