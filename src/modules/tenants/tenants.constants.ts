// Database constraint name -> the message a client should see when it trips
export const TENANT_CONSTRAINT_MESSAGES: Record<string, string> = {
  leases_tenant_company_fk:
    'This tenant still has a lease attached, so it cannot be removed',
};
