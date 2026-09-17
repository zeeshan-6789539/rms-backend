import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../../common/decorators/current-company-id.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UuidParamDto } from '../../common/dto/uuid-param.dto.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import type { IPaginatedResult } from '../../common/interfaces/i-paginated-result.js';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto.js';
import { GenerateMonthlyRentResponseDto } from './dto/generate-monthly-rent-response.dto.js';
import { LedgerEntryResponseDto } from './dto/ledger-entry-response.dto.js';
import { QueryLedgerDto } from './dto/query-ledger.dto.js';
import { LedgerService } from './ledger.service.js';

// Every route here is client_admin only — the ledger is scoped to the caller's company
@ApiTags('Ledger')
@ApiBearerAuth()
@Roles(UserRole.CLIENT_ADMIN)
@Controller({ path: 'ledger', version: '1' })
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post()
  @ResponseMessage('Ledger entry created successfully')
  @ApiOperation({ summary: 'Post a manual charge/credit to a lease\'s ledger' })
  create(
    @CurrentCompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLedgerEntryDto,
  ): Promise<LedgerEntryResponseDto> {
    return this.ledgerService.create(companyId, userId, dto);
  }

  @Get()
  @ResponseMessage('Ledger entries retrieved successfully')
  @ApiOperation({
    summary: 'List ledger entries (charges + payments), paginated and searchable',
    description:
      'Newest first by default, with a running balance per lease. Filter with leaseId; search matches property and tenant name.',
  })
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() query: QueryLedgerDto,
  ): Promise<IPaginatedResult<LedgerEntryResponseDto>> {
    return this.ledgerService.findAll(companyId, query);
  }

  @Get(':id')
  @ResponseMessage('Ledger entry retrieved successfully')
  @ApiOperation({ summary: 'Get a single ledger entry by id' })
  findOne(
    @CurrentCompanyId() companyId: string,
    @Param() params: UuidParamDto,
  ): Promise<LedgerEntryResponseDto> {
    return this.ledgerService.findOne(companyId, params.id);
  }

  @Post('generate-monthly-rent')
  @ResponseMessage('Monthly rent charges generated successfully')
  @ApiOperation({
    summary: 'Generate this month\'s rent charge for every active lease that is missing one',
  })
  generateMonthlyRent(
    @CurrentCompanyId() companyId: string,
    @CurrentUser('id') userId: string,
  ): Promise<GenerateMonthlyRentResponseDto> {
    return this.ledgerService.generateMonthlyRent(companyId, userId);
  }
}
