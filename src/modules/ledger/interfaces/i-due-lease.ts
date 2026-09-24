import type { IActiveLeaseForBilling } from './i-active-lease-for-billing.js';

export interface IDueLease extends IActiveLeaseForBilling {
  rentAmount: string;
}
