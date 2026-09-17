import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { uuidv7 } from '../../common/utils/uuid.util.js';
import { companies } from './companies.schema.js';
import { refreshTokens } from './refresh-tokens.schema.js';

export const userRoleEnum = pgEnum(
  'user_role',
  Object.values(UserRole) as [UserRole, ...UserRole[]],
);

export const users = pgTable(
  'users',
  {
    // Time-ordered v7 rather than random v4 — see common/utils/uuid.util.ts
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    // Null for platform-level users; every tenant user belongs to a company
    companyId: uuid('company_id').references(() => companies.id, {
      onDelete: 'restrict',
    }),
    username: varchar('username', { length: 50 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 32 }),
    role: userRoleEnum('role').notNull().default(UserRole.STAFF),
    // Single lifecycle flag: true is active, false is deactivated. Deleting a
    // user flips this to false — there is no separate deleted_at column.
    status: boolean('status').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // username is the login identifier; email is intentionally non-unique
    uniqueIndex('users_username_unique_idx').on(table.username),
    index('users_email_idx').on(table.email),
    index('users_role_idx').on(table.role),
    index('users_status_idx').on(table.status),
    // Serves the default "latest first" listing without a sort step
    index('users_created_at_idx').on(table.createdAt.desc(), table.id.desc()),
    // Same, filtered to one tenant
    index('users_company_created_at_idx').on(
      table.companyId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    check(
      'users_super_admin_has_no_company',
      sql`${table.role} <> 'super_admin' OR ${table.companyId} IS NULL`,
    ),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  refreshTokens: many(refreshTokens),
}));
