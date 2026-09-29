import { MAX_RENT_DUE_DAY, MIN_RENT_DUE_DAY } from '../../common/constants/rent-due-day.constants.js';

// Database constraint name -> the message a client should see when it trips
export const PROPERTY_CONSTRAINT_MESSAGES: Record<string, string> = {
  leases_property_company_fk:
    'This property still has a lease attached, so it cannot be removed',
  properties_rent_due_day_range_check: `Rent due day must be a day of the month between ${MIN_RENT_DUE_DAY} and ${MAX_RENT_DUE_DAY}`,
};
