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
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UuidParamDto } from '../../common/dto/uuid-param.dto.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { CompaniesService } from './companies.service.js';
import { CompanyResponseDto } from './dto/company-response.dto.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { QueryCompaniesDto } from './dto/query-companies.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';

// Every route here is super_admin only — tenants are managed platform-level
@ApiTags('Companies')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ResponseMessage('Company created successfully')
  @ApiOperation({ summary: 'Create a company (super_admin only)' })
  create(@Body() dto: CreateCompanyDto): Promise<CompanyResponseDto> {
    return this.companiesService.create(dto);
  }

  @Get()
  @ResponseMessage('Companies retrieved successfully')
  @ApiOperation({
    summary: 'List companies, paginated and searchable (super_admin only)',
    description:
      'Newest first by default. Filter with city and status; search matches name, email and city.',
  })
  findAll(
    @Query() query: QueryCompaniesDto,
  ): Promise<IPaginatedResult<CompanyResponseDto>> {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Company retrieved successfully')
  @ApiOperation({ summary: 'Get a company by id (super_admin only)' })
  findOne(@Param() params: UuidParamDto): Promise<CompanyResponseDto> {
    return this.companiesService.findOne(params.id);
  }

  @Patch(':id')
  @ResponseMessage('Company updated successfully')
  @ApiOperation({ summary: 'Update a company (super_admin only)' })
  update(
    @Param() params: UuidParamDto,
    @Body() dto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companiesService.update(params.id, dto);
  }

  @Patch(':id/restore')
  @ResponseMessage('Company reactivated successfully')
  @ApiOperation({ summary: 'Set status back to active (super_admin only)' })
  restore(@Param() params: UuidParamDto): Promise<CompanyResponseDto> {
    return this.companiesService.restore(params.id);
  }

  // 200, not 204 — a 204 carries no body, so the envelope would never arrive
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Company deleted successfully')
  @ApiOperation({
    summary: 'Delete a company (super_admin only)',
    description:
      'Sets status to false. Refused while the company still has active users.',
  })
  remove(@Param() params: UuidParamDto): Promise<CompanyResponseDto> {
    return this.companiesService.remove(params.id);
  }
}
