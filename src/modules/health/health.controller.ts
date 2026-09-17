import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  type HealthCheckResult,
} from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator.js';
import { SkipResponseTransform } from '../../common/decorators/skip-response-transform.decorator.js';
import { DatabaseHealthIndicator } from './indicators/database.health-indicator.js';

const HEAP_LIMIT_BYTES = 512 * 1024 * 1024;

@ApiTags('Health')
@Public()
@SkipResponseTransform()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: 'Process is up and not leaking memory' })
  liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memoryHeap', HEAP_LIMIT_BYTES),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Process can serve traffic and reach its database' })
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.database.isHealthy('database')]);
  }
}
