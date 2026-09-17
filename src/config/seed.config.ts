import { registerAs } from '@nestjs/config';
import { getEnv } from './env.js';
import type { ISeedConfig } from './interfaces/i-seed-config.js';

export const SEED_CONFIG_NAMESPACE = 'seed';

export const seedConfig = registerAs(SEED_CONFIG_NAMESPACE, (): ISeedConfig => {
  const env = getEnv();

  return {
    superAdminUsername: env.SEED_SUPER_ADMIN_USERNAME,
    superAdminEmail: env.SEED_SUPER_ADMIN_EMAIL,
    superAdminPassword: env.SEED_SUPER_ADMIN_PASSWORD,
    superAdminFirstName: env.SEED_SUPER_ADMIN_FIRST_NAME,
    superAdminLastName: env.SEED_SUPER_ADMIN_LAST_NAME,
  };
});
