import {
  Global,
  Inject,
  Logger,
  Module,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { redactConnectionUrl } from '../common/utils/url.util.js';
import { databaseConfig } from '../config/database.config.js';
import type { IDatabaseConfig } from '../config/interfaces/i-database-config.js';
import {
  DRIZZLE,
  PG_CONNECTION_TIMEOUT_MS,
  PG_POOL,
} from './database.constants.js';
import type { IDrizzleDb } from './interfaces/i-drizzle-db.js';
import * as schema from './schema/index.js';

const { Pool } = pg;

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [
    {
      provide: PG_POOL,
      inject: [databaseConfig.KEY],
      useFactory: (config: IDatabaseConfig): pg.Pool =>
        new Pool({
          connectionString: config.url,
          max: config.poolMax,
          connectionTimeoutMillis: PG_CONNECTION_TIMEOUT_MS,
          ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
          // Forces now(), date_trunc and CURRENT_DATE to resolve in UTC.
          // Behind PgBouncer, allow "timezone" in ignore_startup_parameters.
          options: '-c timezone=UTC',
        }),
    },
    {
      provide: DRIZZLE,
      inject: [PG_POOL, databaseConfig.KEY],
      useFactory: (pool: pg.Pool, config: IDatabaseConfig): IDrizzleDb =>
        drizzle(pool, { schema, logger: config.logQueries }),
    },
  ],
  exports: [DRIZZLE, PG_POOL],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: pg.Pool,
    @Inject(databaseConfig.KEY) private readonly config: IDatabaseConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    const target = redactConnectionUrl(this.config.url);

    this.logger.log(`Connecting to Postgres at ${target}...`);

    try {
      const client = await this.pool.connect();

      try {
        const result = await client.query<{ version: string }>(
          'select version()',
        );

        this.logger.log(
          `Postgres connected: ${target} (pool max ${this.config.poolMax}, ssl ${this.config.ssl ? 'on' : 'off'})`,
        );
        this.logger.log(result.rows[0]?.version ?? 'unknown server version');
      } finally {
        client.release();
      }
    } catch (error) {
      this.logger.error(
        `Postgres connection failed: ${target} - ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.log('Postgres pool closed');
  }
}
