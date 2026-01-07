import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Enable cross-origin requests from mobile app
  app.enableCors(AppConfig.cors);

  // Global API prefix
  app.setGlobalPrefix(AppConfig.apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(AppConfig.port);

  console.log(
    `🚀 Backend API is running on: http://localhost:${AppConfig.port}/${AppConfig.apiPrefix}`,
  );
  console.log(
    `📱 Mobile app can connect to: http://localhost:${AppConfig.port}`,
  );
}
void bootstrap();
