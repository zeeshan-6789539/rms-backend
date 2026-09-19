import { ApiProperty } from '@nestjs/swagger';
import { LeaseStatus } from '../../../common/enums/lease-status.enum.js';
import { PaymentMethod } from '../../../common/enums/payment-method.enum.js';

export class DashboardTotalsDto {
  @ApiProperty() tenants!: number;
  @ApiProperty() activeTenants!: number;
  @ApiProperty() properties!: number;
  @ApiProperty() activeLeases!: number;
  @ApiProperty({ description: 'Properties with a currently active lease' })
  assignedProperties!: number;
  @ApiProperty() paymentsThisMonthCount!: number;
  @ApiProperty({ example: '150000.00' }) paymentsThisMonthTotal!: string;
  @ApiProperty({ example: '120000.00' }) paymentsLastMonthTotal!: string;
}

export class DashboardTrendPointDto {
  @ApiProperty({ example: '2026-04' }) month!: string;
  @ApiProperty({ example: '150000.00' }) total!: string;
}

export class DashboardPropertyStatusBreakdownDto {
  @ApiProperty() status!: boolean;
  @ApiProperty() count!: number;
}

export class DashboardRecentPaymentDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: '50000.00' }) amountPaid!: string;
  @ApiProperty({ format: 'date' }) paymentDate!: string;
  @ApiProperty({ enum: PaymentMethod }) paymentMethod!: PaymentMethod;
  @ApiProperty({ example: 'Ali Raza' }) tenantName!: string;
  @ApiProperty({ example: 'Sunset Apartments' }) propertyName!: string;
}

export class DashboardOutstandingLeaseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Sunset Apartments' }) propertyName!: string;
  @ApiProperty({ example: 'Ali Raza' }) tenantName!: string;
  @ApiProperty({ enum: LeaseStatus }) status!: LeaseStatus;
  @ApiProperty({ example: '15000.00' }) outstandingBalance!: string;
}

export class DashboardStatsResponseDto {
  @ApiProperty({ type: DashboardTotalsDto })
  totals!: DashboardTotalsDto;

  @ApiProperty({ type: [DashboardTrendPointDto], description: 'Payments trend, oldest first' })
  paymentsTrend!: DashboardTrendPointDto[];

  @ApiProperty({ type: [DashboardPropertyStatusBreakdownDto] })
  propertyStatusBreakdown!: DashboardPropertyStatusBreakdownDto[];

  @ApiProperty({ type: [DashboardRecentPaymentDto] })
  recentPayments!: DashboardRecentPaymentDto[];

  @ApiProperty({ type: [DashboardOutstandingLeaseDto], description: 'Active leases with a remaining balance, highest first' })
  outstandingLeases!: DashboardOutstandingLeaseDto[];
}
