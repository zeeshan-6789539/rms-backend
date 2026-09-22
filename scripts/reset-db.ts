import { config } from 'dotenv';
import pg from 'pg';

// Same precedence as ConfigModule in app.module.ts — first file wins
config({ path: ['.env.local', '.env'], quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set — check .env or .env.local');
}

if (process.env.NODE_ENV === 'production') {
  throw new Error('reset-db refuses to run with NODE_ENV=production');
}

const targetUrl = new URL(databaseUrl);
const databaseName = decodeURIComponent(targetUrl.pathname.slice(1));

if (!databaseName) {
  throw new Error(`DATABASE_URL has no database name: ${databaseUrl}`);
}

const target = new pg.Client({ connectionString: targetUrl.toString() });
await target.connect();

try {
  const { rows } = await target.query<{ server: string }>('select version() as server');
  console.log(`Server: ${rows[0].server.split(',')[0]}`);
  console.log(`Target: ${databaseName} @ ${targetUrl.host}`);

  const { rows: tables } = await target.query<{ tablename: string }>(
    "select tablename from pg_tables where schemaname = 'public'",
  );

  if (tables.length === 0) {
    console.log('No tables found — nothing to truncate');
  } else {
    const tableList = tables.map(({ tablename }) => `"${tablename}"`).join(', ');
    await target.query(`truncate table ${tableList} restart identity cascade`);
    console.log(`Truncated ${tables.length} table(s): ${tables.map((t) => t.tablename).join(', ')}`);
  }

  // drizzle-kit push can leave a stale, non-partial version of this index behind — repair it so deactivated charges stay re-generatable
  if (tables.some(({ tablename }) => tablename === 'charges')) {
    const { rows: existingIndexes } = await target.query<{ indexdef: string }>(
      "select indexdef from pg_indexes where tablename = 'charges' and indexname = 'charges_one_monthly_rent_per_lease_month_idx'",
    );
    const isPartialOnStatus = existingIndexes[0]?.indexdef.includes('status = true') ?? false;

    if (!isPartialOnStatus) {
      await target.query('drop index if exists charges_one_monthly_rent_per_lease_month_idx');
      await target.query(
        "create unique index charges_one_monthly_rent_per_lease_month_idx on charges (lease_id, billing_month) where charge_type = 'monthly_rent' and status = true",
      );
      console.log('Recreated charges_one_monthly_rent_per_lease_month_idx as a partial index (status = true)');
    }
  }
} finally {
  await target.end();
}
