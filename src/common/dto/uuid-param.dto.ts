import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UuidParamDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID(undefined, { message: 'id must be a valid UUID' })
  id!: string;
}
