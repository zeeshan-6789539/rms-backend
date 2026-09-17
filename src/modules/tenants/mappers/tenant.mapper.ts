import type { ITenantRow } from '../../../database/interfaces/i-tenant-row.js';
import type { TenantResponseDto } from '../dto/tenant-response.dto.js';

export const toTenantResponse = (row: ITenantRow): TenantResponseDto => ({
  id: row.id,
  companyId: row.companyId,
  name: row.name,
  email: row.email,
  phone: row.phone,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
