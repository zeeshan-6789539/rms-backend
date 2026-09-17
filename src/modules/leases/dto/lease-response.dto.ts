import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaseStatus } from '../../../common/enums/lease-status.enum.js';

export class LeaseResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  companyId!: string;

  @ApiProperty({ format: 'uuid' })
  propertyId!: string;

  @ApiProperty({ format: 'uuid' })
  tenantId!: string;

  @ApiProperty({ example: 'Sunset Apartments' })
  propertyName!: string;

  @ApiProperty({ example: 'Ali Raza' })
  tenantName!: string;

  @ApiProperty({ enum: LeaseStatus })
  status!: LeaseStatus;

  @ApiProperty({ format: 'date' })
  startDate!: string;

  @ApiProperty({ format: 'date' })
  endDate!: string;

  @ApiProperty({ example: '100000.00' })
  advanceAmount!: string;

  @ApiPropertyOptional({ nullable: true, example: '50000.00' })
  currentRent!: string | null;

  @ApiProperty({ example: '25000.00', description: 'Sum of charges minus payments to date' })
  outstandingBalance!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
