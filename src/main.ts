import './bootstrap/timezone.bootstrap.js';
import { RequestMethod, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { setupSwagger } from './bootstrap/swagger.bootstrap.js';
import { createRequestLogger } from './common/middleware/request-logger.middleware.js';
import { createAppLogger } from './common/utils/logger.util.js';
import { interopDefault } from './common/utils/module.util.js';
import { appConfig } from './config/app.config.js';
import type { IAppConfig } from './config/interfaces/i-app-config.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get<IAppConfig>(appConfig.KEY);

  app.useLogger(createAppLogger(config));
  app.use(createRequestLogger(['/health']));
  app.use(interopDefault(helmet)());
  app.use(compression());
  app.enableCors({ origin: config.corsOrigins, credentials: true });
  app.setGlobalPrefix(config.apiPrefix, {
    exclude: [
      { path: 'health/liveness', method: RequestMethod.GET },
      { path: 'health/readiness', method: RequestMethod.GET },
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.apiVersion,
  });
  app.enableShutdownHooks();

  if (config.swaggerEnabled) {
    setupSwagger(app, config);
  }

  await app.listen(config.port);
}

await bootstrap();
