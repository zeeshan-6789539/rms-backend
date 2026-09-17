// Database constraint name -> the message a client should see when it trips
export const CHARGE_CONSTRAINT_MESSAGES: Record<string, string> = {
  charges_one_monthly_rent_per_lease_month_idx:
    'A monthly rent charge has already been generated for this lease this month',
};
