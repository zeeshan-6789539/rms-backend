import type { IUserRow } from '../../../database/interfaces/i-user-row.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';

// Strips passwordHash before a row leaves the API
export const toUserResponse = (row: IUserRow): UserResponseDto => ({
  id: row.id,
  companyId: row.companyId,
  username: row.username,
  email: row.email,
  firstName: row.firstName,
  lastName: row.lastName,
  phone: row.phone,
  role: row.role,
  status: row.status,
  lastLoginAt: row.lastLoginAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
