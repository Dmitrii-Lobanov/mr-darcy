import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SessionsModule } from './sessions/sessions.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mr. Darcy API')
    .setDescription('Reservations, properly arranged. Public session catalog.')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [SessionsModule],
  });

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001, '127.0.0.1');

  console.log('Mr. Darcy API: http://127.0.0.1:3001/api/health');
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start the API:', error);
  process.exitCode = 1;
});
