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

  // Listen on all network interfaces (0.0.0.0) to allow mobile device connections
  await app.listen(AppConfig.port, '0.0.0.0');

  console.log(
    `🚀 Backend API is running on: http://localhost:${AppConfig.port}/${AppConfig.apiPrefix}`,
  );
  console.log(
    `📱 Mobile app can connect to: http://192.168.1.5:${AppConfig.port}/${AppConfig.apiPrefix}`,
  );
}
void bootstrap();
