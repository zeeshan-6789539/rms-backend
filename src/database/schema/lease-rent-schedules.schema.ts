import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  date,
  foreignKey,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from '../../common/utils/uuid.util.js';
import { companies } from './companies.schema.js';
import { leases } from './leases.schema.js';

export const leaseRentSchedules = pgTable(
  'lease_rent_schedules',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'restrict' }),
    leaseId: uuid('lease_id').notNull(),
    rentAmount: numeric('rent_amount', { precision: 10, scale: 2 }).notNull(),
    effectiveFrom: date('effective_from').notNull(),
    effectiveTo: date('effective_to'),
    isCurrent: boolean('is_current').notNull().default(true),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('lease_rent_schedules_lease_id_idx').on(table.leaseId),
    index('lease_rent_schedules_company_created_at_idx').on(
      table.companyId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    // Composite FK pins lease_id to the same company_id as this schedule row
    foreignKey({
      columns: [table.leaseId, table.companyId],
      foreignColumns: [leases.id, leases.companyId],
      name: 'lease_rent_schedules_lease_company_fk',
    }),
    // At most one "current" rent schedule per lease
    uniqueIndex('lease_rent_schedules_current_per_lease_idx')
      .on(table.leaseId)
      .where(sql`${table.isCurrent} = true`),
  ],
);

export const leaseRentSchedulesRelations = relations(
  leaseRentSchedules,
  ({ one }) => ({
    company: one(companies, {
      fields: [leaseRentSchedules.companyId],
      references: [companies.id],
    }),
    lease: one(leases, {
      fields: [leaseRentSchedules.leaseId],
      references: [leases.id],
    }),
  }),
);
