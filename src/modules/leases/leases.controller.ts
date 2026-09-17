import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../../common/decorators/current-company-id.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UuidParamDto } from '../../common/dto/uuid-param.dto.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { CreateLeaseDto } from './dto/create-lease.dto.js';
import { LeaseResponseDto } from './dto/lease-response.dto.js';
import { QueryLeasesDto } from './dto/query-leases.dto.js';
import { UpdateLeaseDto } from './dto/update-lease.dto.js';
import { UpdateLeaseRentDto } from './dto/update-lease-rent.dto.js';
import { UpdateLeaseStatusDto } from './dto/update-lease-status.dto.js';
import { LeasesService } from './leases.service.js';

// Every route here is client_admin only — leases are scoped to the caller's company
@ApiTags('Leases')
@ApiBearerAuth()
@Roles(UserRole.CLIENT_ADMIN)
@Controller({ path: 'leases', version: '1' })
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Post()
  @ResponseMessage('Lease created successfully')
  @ApiOperation({ summary: 'Create a lease, seeding its first rent schedule' })
  create(
    @CurrentCompanyId() companyId: string,
    @Body() dto: CreateLeaseDto,
  ): Promise<LeaseResponseDto> {
    return this.leasesService.create(companyId, dto);
  }

  @Get()
  @ResponseMessage('Leases retrieved successfully')
  @ApiOperation({
    summary: 'List leases, paginated and searchable',
    description:
      'Newest first by default. Filter with propertyId, tenantId and status; search matches property and tenant name.',
  })
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() query: QueryLeasesDto,
  ): Promise<IPaginatedResult<LeaseResponseDto>> {
    return this.leasesService.findAll(companyId, query);
  }

  @Get(':id')
  @ResponseMessage('Lease retrieved successfully')
  @ApiOperation({ summary: 'Get a lease by id' })
  findOne(
    @CurrentCompanyId() companyId: string,
    @Param() params: UuidParamDto,
  ): Promise<LeaseResponseDto> {
    return this.leasesService.findOne(companyId, params.id);
  }

  @Patch(':id')
  @ResponseMessage('Lease updated successfully')
  @ApiOperation({ summary: 'Update a lease\'s dates or advance amount' })
  update(
    @CurrentCompanyId() companyId: string,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateLeaseDto,
  ): Promise<LeaseResponseDto> {
    return this.leasesService.update(companyId, params.id, dto);
  }

  @Patch(':id/status')
  @ResponseMessage('Lease status updated successfully')
  @ApiOperation({ summary: 'Change a lease\'s lifecycle status' })
  updateStatus(
    @CurrentCompanyId() companyId: string,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateLeaseStatusDto,
  ): Promise<LeaseResponseDto> {
    return this.leasesService.updateStatus(companyId, params.id, dto);
  }

  @Patch(':id/rent')
  @ResponseMessage('Lease rent updated successfully')
  @ApiOperation({
    summary: 'Change the monthly rent from a given date',
    description: 'Closes the current rent schedule and opens a new one, logging the change on the ledger.',
  })
  updateRent(
    @CurrentCompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateLeaseRentDto,
  ): Promise<LeaseResponseDto> {
    return this.leasesService.updateRent(companyId, params.id, userId, dto);
  }
}
