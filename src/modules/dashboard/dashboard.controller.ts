import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../../common/decorators/current-company-id.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardStatsQueryDto } from './dto/dashboard-stats-query.dto.js';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(UserRole.CLIENT_ADMIN)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ResponseMessage('Dashboard stats retrieved successfully')
  @ApiOperation({ summary: "Aggregate stats for the caller's company" })
  getStats(
    @CurrentCompanyId() companyId: string,
    @Query() query: DashboardStatsQueryDto,
  ): Promise<DashboardStatsResponseDto> {
    return this.dashboardService.getStats(companyId, query.trendRange);
  }
}
