// Database constraint name -> the message a client should see when it trips
export const COMPANY_CONSTRAINT_MESSAGES: Record<string, string> = {
  users_company_id_companies_id_fk:
    'This company still has users attached, so it cannot be removed',
};
