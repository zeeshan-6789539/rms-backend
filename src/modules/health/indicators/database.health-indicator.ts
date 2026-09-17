import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { DRIZZLE } from '../../../database/database.constants.js';
import type { IDrizzleDb } from '../../../database/interfaces/i-drizzle-db.js';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(DRIZZLE) private readonly db: IDrizzleDb,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    const startedAt = Date.now();

    try {
      await this.db.execute(sql`select 1`);

      return indicator.up({ responseTimeMs: Date.now() - startedAt });
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
