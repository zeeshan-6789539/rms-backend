import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DashboardTrendRange } from '../../../common/enums/dashboard-trend-range.enum.js';

export class DashboardStatsQueryDto {
  @ApiPropertyOptional({ enum: DashboardTrendRange, default: DashboardTrendRange.SIX_MONTHS })
  @IsEnum(DashboardTrendRange, {
    message: `trendRange must be one of: ${Object.values(DashboardTrendRange).join(', ')}`,
  })
  @IsOptional()
  trendRange: DashboardTrendRange = DashboardTrendRange.SIX_MONTHS;
}
