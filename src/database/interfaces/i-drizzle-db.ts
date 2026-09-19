import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type pg from 'pg';
import type * as schema from '../schema/index.js';

export type IDrizzleDb = NodePgDatabase<typeof schema> & { $client: pg.Pool };

// The handle drizzle passes into a `db.transaction(async (tx) => ...)` callback.
// Derived structurally so it always matches whatever this project's IDrizzleDb
// resolves to, instead of importing drizzle's internal transaction type by name.
export type IDrizzleTransaction = Parameters<
  Parameters<IDrizzleDb['transaction']>[0]
>[0];
