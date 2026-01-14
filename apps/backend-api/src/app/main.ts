import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { getLocalNetworkIP } from '../common/utils/network.util';

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

  // Note: TransformInterceptor is already registered in AppModule
  // No need to register again here

  // Listen on all network interfaces (0.0.0.0) to allow mobile device connections
  await app.listen(AppConfig.port, '0.0.0.0');

  // Auto-detect local network IP
  const localIP = getLocalNetworkIP();

  console.log('\n🚀 Backend API is running!');
  console.log(`   Local:   http://localhost:${AppConfig.port}/${AppConfig.apiPrefix}`);
  console.log(`   Network: http://${localIP}:${AppConfig.port}/${AppConfig.apiPrefix}`);
  console.log('\n📱 For mobile app, update your .env file:');
  console.log(`   EXPO_PUBLIC_API_URL=http://${localIP}:${AppConfig.port}/${AppConfig.apiPrefix}\n`);
}
void bootstrap();
