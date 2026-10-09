import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { DashboardTrendRange } from '../../common/enums/dashboard-trend-range.enum.js';
import { LeaseStatus } from '../../common/enums/lease-status.enum.js';
import { PropertyType } from '../../common/enums/property-type.enum.js';
import { SortOrder } from '../../common/enums/sort-order.enum.js';
import type { IAiTool } from '../../common/interfaces/i-ai-tool.js';
import { defineAiTool } from '../../common/utils/ai-tool.util.js';
import { DashboardService } from '../dashboard/dashboard.service.js';
import { LeasesService } from '../leases/leases.service.js';
import { LedgerService } from '../ledger/ledger.service.js';
import { PaymentsService } from '../payments/payments.service.js';
import { PropertiesService } from '../properties/properties.service.js';
import { TenantsService } from '../tenants/tenants.service.js';
import { AI_TOOL_DEFAULT_PAGE_SIZE, AI_TOOL_MAX_PAGE_SIZE } from './ai.constants.js';

const listArgs = {
  page: z.number().int().min(1).default(1).describe('1-based page number'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(AI_TOOL_MAX_PAGE_SIZE)
    .default(AI_TOOL_DEFAULT_PAGE_SIZE)
    .describe('Records per page'),
  sortOrder: z
    .enum(SortOrder)
    .default(SortOrder.DESC)
    .describe('desc returns the newest records first'),
};

const searchArg = (matches: string): z.ZodOptional<z.ZodString> =>
  z.string().max(255).optional().describe(`Case-insensitive text that matches ${matches}`);

const idArg = (entity: string): z.ZodUUID =>
  z.uuid().describe(`The ${entity} id, taken from an earlier search result`);

const statusArg = (entity: string): z.ZodOptional<z.ZodBoolean> =>
  z
    .boolean()
    .optional()
    .describe(`true for active ${entity}, false for deactivated ones; omit for both`);

// Read-only on purpose: writes need a confirmation step before Gemini may trigger them
@Injectable()
export class AiToolsService {
  private readonly tools: Map<string, IAiTool>;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly propertiesService: PropertiesService,
    private readonly tenantsService: TenantsService,
    private readonly leasesService: LeasesService,
    private readonly paymentsService: PaymentsService,
    private readonly ledgerService: LedgerService,
  ) {
    this.tools = new Map(
      this.buildTools().map((tool) => [tool.declaration.name ?? '', tool]),
    );
  }

  get declarations(): IAiTool['declaration'][] {
    return [...this.tools.values()].map((tool) => tool.declaration);
  }

  find(name: string): IAiTool | undefined {
    return this.tools.get(name);
  }

  private buildTools(): IAiTool[] {
    return [
      defineAiTool(
        'get_dashboard_stats',
        'Company overview: totals of tenants, properties and active leases, payments this month and last month, monthly payment trend, property status breakdown, recent payments and leases with an outstanding balance. Use it for summaries and "how are we doing" questions.',
        z.object({
          trendRange: z
            .enum(DashboardTrendRange)
            .default(DashboardTrendRange.SIX_MONTHS)
            .describe('How far back the monthly payment trend goes'),
        }),
        (companyId, args) => this.dashboardService.getStats(companyId, args.trendRange),
      ),
      defineAiTool(
        'search_properties',
        'List the company properties, paginated. Each has a property number like P-0001.',
        z.object({
          ...listArgs,
          search: searchArg('property name and city'),
          city: z.string().max(100).optional().describe('Exact city filter'),
          propertyType: z.enum(PropertyType).optional(),
          status: statusArg('properties'),
        }),
        (companyId, args) => this.propertiesService.findAll(companyId, args),
      ),
      defineAiTool(
        'get_property',
        'Full details of one property.',
        z.object({ propertyId: idArg('property') }),
        (companyId, args) => this.propertiesService.findOne(companyId, args.propertyId),
      ),
      defineAiTool(
        'search_tenants',
        'List the company tenants, paginated.',
        z.object({
          ...listArgs,
          search: searchArg('tenant name, email and phone'),
          status: statusArg('tenants'),
        }),
        (companyId, args) => this.tenantsService.findAll(companyId, args),
      ),
      defineAiTool(
        'get_tenant',
        'Full details of one tenant.',
        z.object({ tenantId: idArg('tenant') }),
        (companyId, args) => this.tenantsService.findOne(companyId, args.tenantId),
      ),
      defineAiTool(
        'search_leases',
        'List leases, paginated, with their property, tenant, rent and dates.',
        z.object({
          ...listArgs,
          search: searchArg('property name and tenant name'),
          status: z.enum(LeaseStatus).optional(),
          propertyId: idArg('property').optional(),
          tenantId: idArg('tenant').optional(),
        }),
        (companyId, args) => this.leasesService.findAll(companyId, args),
      ),
      defineAiTool(
        'get_lease',
        'Full details of one lease.',
        z.object({ leaseId: idArg('lease') }),
        (companyId, args) => this.leasesService.findOne(companyId, args.leaseId),
      ),
      defineAiTool(
        'search_payments',
        'List rent payments received, paginated.',
        z.object({
          ...listArgs,
          search: searchArg('property name and tenant name'),
          leaseId: idArg('lease').optional(),
        }),
        (companyId, args) => this.paymentsService.findAll(companyId, args),
      ),
      defineAiTool(
        'get_ledger',
        'Ledger entries (rent and other charges, and payments) with a running balance per lease, paginated. Pass leaseId for one lease statement and its current balance.',
        z.object({
          ...listArgs,
          search: searchArg('property name and tenant name'),
          leaseId: idArg('lease').optional(),
        }),
        (companyId, args) => this.ledgerService.findAll(companyId, args),
      ),
    ];
  }
}
