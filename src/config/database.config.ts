import { registerAs } from '@nestjs/config';
import { getEnv } from './env.js';
import type { IDatabaseConfig } from './interfaces/i-database-config.js';

export const DATABASE_CONFIG_NAMESPACE = 'database';

export const databaseConfig = registerAs(
  DATABASE_CONFIG_NAMESPACE,
  (): IDatabaseConfig => {
    const env = getEnv();

    return {
      url: env.DATABASE_URL,
      poolMax: env.DATABASE_POOL_MAX,
      ssl: env.DATABASE_SSL,
      logQueries: env.DATABASE_LOG_QUERIES,
    };
  },
);
