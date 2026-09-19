// Database constraint name -> the message a client should see when it trips
export const SUBCATEGORY_CONSTRAINT_MESSAGES: Record<string, string> = {
  subcategories_name_category_unique_idx:
    'A subcategory with this name already exists for this category',
  subcategories_category_id_categories_id_fk:
    'The referenced category does not exist',
};
