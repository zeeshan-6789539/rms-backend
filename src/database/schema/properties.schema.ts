import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from '../../common/utils/uuid.util.js';
import { companies } from './companies.schema.js';
import { leases } from './leases.schema.js';

export const properties = pgTable(
  'properties',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    addressLine1: varchar('address_line1', { length: 500 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    // true is active, false is deactivated — mirrors companies.status
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
    index('properties_name_idx').on(table.name),
    index('properties_status_idx').on(table.status),
    index('properties_created_at_idx').on(
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index('properties_company_created_at_idx').on(
      table.companyId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    // Lets leases/charges/payments composite-FK pin a row to this same company
    unique('properties_id_company_id_key').on(table.id, table.companyId),
  ],
);

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  company: one(companies, {
    fields: [properties.companyId],
    references: [companies.id],
  }),
  leases: many(leases),
}));
