import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { LeaseStatus } from '../../../common/enums/lease-status.enum.js';

export class UpdateLeaseStatusDto {
  @ApiProperty({ enum: LeaseStatus })
  @IsEnum(LeaseStatus, {
    message: `status must be one of: ${Object.values(LeaseStatus).join(', ')}`,
  })
  status!: LeaseStatus;
}
