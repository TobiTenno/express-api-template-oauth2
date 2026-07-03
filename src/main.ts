import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { AppModule } from './modules/app.module';
import { createAppLogger } from './common/utils/logger';

async function bootstrap(): Promise<void> {
  const logger = createAppLogger('PROC');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
  });

  app.enableCors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080',
  });

  app.useStaticAssets(join(process.cwd(), 'public'));

  const faviconPath = join(process.cwd(), 'public', 'favicon.ico');
  if (existsSync(faviconPath)) {
    const { default: favicon } = await import('serve-favicon');
    app.use(favicon(faviconPath));
  }

  if (process.env.ENABLE_SWAGGER === 'true') {
    try {
      const swaggerStats = await import('swagger-stats');
      const openapiPath = join(process.cwd(), 'openapi.yaml');
      const swaggerSpec = parseYaml(readFileSync(openapiPath, 'utf8'));
      const getMiddleware = swaggerStats.getMiddleware ?? swaggerStats.default?.getMiddleware;
      app.use(
        getMiddleware({
          swaggerSpec,
          uriPath: '/meta/status',
        }),
      );
    } catch (err) {
      logger.error(`Failed to enable swagger-stats: ${(err as Error).message}`);
    }
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Express API Template')
    .setDescription('This is a sample server Example server.')
    .setVersion('0.0.0-dev')
    .addBearerAuth()
    .addBasicAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('meta/swagger', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.debug(`Listening on port ${port}`);
}

await bootstrap();
