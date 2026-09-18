import '../../bootstrap/timezone.bootstrap.js';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { DRIZZLE } from '../database.constants.js';
import type { IDrizzleDb } from '../interfaces/i-drizzle-db.js';
import { seedDemoData } from './demo-data.seed.js';

const logger = new Logger('DemoSeed');
const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn', 'log'],
});

try {
  await seedDemoData(app.get<IDrizzleDb>(DRIZZLE), logger);
  logger.log('Demo data seeding complete');
} catch (error) {
  logger.error(
    `Demo data seeding failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
} finally {
  await app.close();
}
