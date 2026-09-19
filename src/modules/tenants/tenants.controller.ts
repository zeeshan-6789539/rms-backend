import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../../common/decorators/current-company-id.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UuidParamDto } from '../../common/dto/uuid-param.dto.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { QueryTenantsDto } from './dto/query-tenants.dto.js';
import { TenantListResponseDto } from './dto/tenant-list-response.dto.js';
import { TenantResponseDto } from './dto/tenant-response.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
import { TenantsService } from './tenants.service.js';

// Every route here is client_admin only — tenants are scoped to the caller's company
@ApiTags('Tenants')
@ApiBearerAuth()
@Roles(UserRole.CLIENT_ADMIN)
@Controller({ path: 'tenants', version: '1' })
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ResponseMessage('Tenant created successfully')
  @ApiOperation({ summary: 'Create a tenant' })
  create(
    @CurrentCompanyId() companyId: string,
    @Body() dto: CreateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.create(companyId, dto);
  }

  @Get()
  @ResponseMessage('Tenants retrieved successfully')
  @ApiOperation({
    summary: 'List tenants, paginated and searchable',
    description:
      'Newest first by default. Filter with status; search matches name, email and phone.',
  })
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() query: QueryTenantsDto,
  ): Promise<IPaginatedResult<TenantListResponseDto>> {
    return this.tenantsService.findAll(companyId, query);
  }

  @Get(':id')
  @ResponseMessage('Tenant retrieved successfully')
  @ApiOperation({ summary: 'Get a tenant by id' })
  findOne(
    @CurrentCompanyId() companyId: string,
    @Param() params: UuidParamDto,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.findOne(companyId, params.id);
  }

  @Patch(':id')
  @ResponseMessage('Tenant updated successfully')
  @ApiOperation({ summary: 'Update a tenant' })
  update(
    @CurrentCompanyId() companyId: string,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.update(companyId, params.id, dto);
  }

  @Patch(':id/restore')
  @ResponseMessage('Tenant reactivated successfully')
  @ApiOperation({ summary: 'Set status back to active' })
  restore(
    @CurrentCompanyId() companyId: string,
    @Param() params: UuidParamDto,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.restore(companyId, params.id);
  }

  // 200, not 204 — a 204 carries no body, so the envelope would never arrive
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tenant deleted successfully')
  @ApiOperation({
    summary: 'Delete a tenant',
    description: 'Sets status to false. The row is kept for audit purposes.',
  })
  remove(
    @CurrentCompanyId() companyId: string,
    @Param() params: UuidParamDto,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.remove(companyId, params.id);
  }
}
