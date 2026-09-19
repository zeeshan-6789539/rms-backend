// Database constraint name -> the message a client should see when it trips
export const PRODUCT_CONSTRAINT_MESSAGES: Record<string, string> = {
  products_subcategory_id_subcategories_id_fk:
    'The referenced subcategory does not exist',
  products_quantity_non_negative: 'Quantity cannot be negative',
};
