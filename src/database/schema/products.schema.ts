import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from '../../common/utils/uuid.util.js';
import { companies } from './companies.schema.js';
import { productPriceHistory } from './product-price-history.schema.js';
import { subcategories } from './subcategories.schema.js';
import { users } from './users.schema.js';

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    name: varchar('name', { length: 255 }).notNull(),
    // Auto-incrementing, human-friendly identifier — separate from the uuid pk
    sku: serial('sku').notNull().unique(),
    quantity: integer('quantity').notNull().default(0),
    subcategoryId: uuid('subcategory_id')
      .notNull()
      .references(() => subcategories.id, { onDelete: 'restrict' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    // Current price lives in product_price_history, not on this row
    status: boolean('status').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('products_company_status_idx').on(table.companyId, table.status),
    index('products_subcategory_idx').on(table.subcategoryId),
    index('products_created_by_user_idx').on(table.createdByUserId),
    index('products_created_at_idx').on(
      table.createdAt.desc(),
      table.id.desc(),
    ),
    check('products_quantity_non_negative', sql`${table.quantity} >= 0`),
  ],
);

export const productsRelations = relations(products, ({ one, many }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  company: one(companies, {
    fields: [products.companyId],
    references: [companies.id],
  }),
  createdBy: one(users, {
    fields: [products.createdByUserId],
    references: [users.id],
  }),
  priceHistory: many(productPriceHistory),
}));
