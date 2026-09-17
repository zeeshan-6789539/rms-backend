// Database constraint name -> the message a client should see when it trips
export const PROPERTY_CONSTRAINT_MESSAGES: Record<string, string> = {
  leases_property_company_fk:
    'This property still has a lease attached, so it cannot be removed',
};
