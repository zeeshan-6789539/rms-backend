import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type pg from 'pg';
import type * as schema from '../schema/index.js';

export type IDrizzleDb = NodePgDatabase<typeof schema> & { $client: pg.Pool };
