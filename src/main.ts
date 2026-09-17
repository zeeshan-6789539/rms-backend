import './bootstrap/timezone.bootstrap.js';
import { RequestMethod, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { setupSwagger } from './bootstrap/swagger.bootstrap.js';
import { appConfig } from './config/app.config.js';
import type { IAppConfig } from './config/interfaces/i-app-config.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get<IAppConfig>(appConfig.KEY);

  app.useLogger(app.get(Logger));
  app.use(helmet());
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
