import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { doubleCsrfProtection } from './middleware/csrf';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['x-csrf-token'],
  });

  app.use(cookieParser());
  app.use(doubleCsrfProtection);
  app.setGlobalPrefix('api/v1');

  console.log(`Application is running on: ${process.env.PORT ?? 3000}`);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
