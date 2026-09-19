import '../../bootstrap/timezone.bootstrap.js';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { seedConfig } from '../../config/seed.config.js';
import type { ISeedConfig } from '../../config/interfaces/i-seed-config.js';
import { DRIZZLE } from '../database.constants.js';
import type { IDrizzleDb } from '../interfaces/i-drizzle-db.js';
import { UsersService } from '../../modules/users/users.service.js';
import { seedDemoData } from './demo-data.seed.js';
import { seedSuperAdmin } from './super-admin.seed.js';

const logger = new Logger('Seed');
const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn', 'log'],
});

try {
  const config = app.get<ISeedConfig>(seedConfig.KEY);

  await seedSuperAdmin(app.get(UsersService), config);

  if (config.seedDemoData) {
    await seedDemoData(app.get<IDrizzleDb>(DRIZZLE));
  }

  logger.log('Seeding complete');
} catch (error) {
  logger.error(
    `Seeding failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
} finally {
  await app.close();
}
