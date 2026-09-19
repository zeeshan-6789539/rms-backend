import type { IPropertyRow } from '../../../database/interfaces/i-property-row.js';
import type { PropertyListResponseDto } from '../dto/property-list-response.dto.js';
import type { PropertyResponseDto } from '../dto/property-response.dto.js';
import type { IPropertyListRow } from '../interfaces/i-property-list-row.js';

export const toPropertyResponse = (row: IPropertyRow): PropertyResponseDto => ({
  id: row.id,
  companyId: row.companyId,
  name: row.name,
  addressLine1: row.addressLine1,
  addressLine2: row.addressLine2,
  city: row.city,
  state: row.state,
  postalCode: row.postalCode,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const toPropertyListResponse = (
  row: IPropertyListRow,
): PropertyListResponseDto => ({
  id: row.id,
  companyId: row.companyId,
  name: row.name,
  addressLine1: row.addressLine1,
  addressLine2: row.addressLine2,
  city: row.city,
  state: row.state,
  postalCode: row.postalCode,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  tenants: row.tenants,
});
