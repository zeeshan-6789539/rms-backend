// Database constraint name -> the message a client should see when it trips
export const CATEGORY_CONSTRAINT_MESSAGES: Record<string, string> = {
  categories_name_company_unique_idx:
    'A category with this name already exists for this company',
  categories_company_id_companies_id_fk:
    'The referenced company does not exist',
};
