import type { UserRole } from '../../../common/enums/user-role.enum.js';
import type { IPropertySeedPlan } from './i-property-seed-plan.js';

export interface IUserSeedPlan {
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface ICompanySeedPlan {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  receiptPrefix: string;
  users: IUserSeedPlan[];
  properties: IPropertySeedPlan[];
  // Tenants with no lease yet — still prospecting
  spareTenantNames: string[];
}
