import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import { ROLES_KEY } from '../constants/metadata.constants.js';
import type { UserRole } from '../enums/user-role.enum.js';

export const Roles = (...roles: UserRole[]): CustomDecorator =>
  SetMetadata(ROLES_KEY, roles);
