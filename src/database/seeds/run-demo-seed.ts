import '../../bootstrap/timezone.bootstrap.js';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { seedConfig } from '../../config/seed.config.js';
import type { ISeedConfig } from '../../config/interfaces/i-seed-config.js';
import { UsersService } from '../../modules/users/users.service.js';
import { DRIZZLE } from '../database.constants.js';
import type { IDrizzleDb } from '../interfaces/i-drizzle-db.js';
import { seedDemoData } from './demo-data.seed.js';
import { seedSuperAdmin } from './super-admin.seed.js';

const logger = new Logger('DemoSeed');
const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn', 'log'],
});

try {
  const config = app.get<ISeedConfig>(seedConfig.KEY);

  await seedSuperAdmin(app.get(UsersService), config);
  await seedDemoData(app.get<IDrizzleDb>(DRIZZLE));

  logger.log('Demo seeding complete');
} catch (error) {
  logger.error(
    `Demo seeding failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
} finally {
  await app.close();
}
