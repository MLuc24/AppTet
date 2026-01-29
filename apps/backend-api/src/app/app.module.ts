import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { CourseModule } from '../modules/course/course.module';
import { UnitModule } from '../modules/unit/unit.module';
import { SkillModule } from '../modules/skill/skill.module';
import { LessonModule } from '../modules/lesson/lesson.module';
import { ExerciseModule } from '../modules/exercise/exercise.module';
import { LearningModule } from '../modules/learning/learning.module';
import { AiModule } from '../modules/ai/ai.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { EmailModule } from '../modules/email/email.module';
import { MediaModule } from '../modules/media/media.module';
import { HomeModule } from '../modules/home/home.module';
import { GamificationModule } from '../modules/gamification/gamification.module';

// Global guards, filters, interceptors
import { AuthGuard } from '../common/guards/auth.guard';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@Module({
  imports: [
    // Config module (load .env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '.env.local'],
    }),

    EmailModule,
    MediaModule,
    AuthModule,
    UserModule,
    CourseModule,
    UnitModule,
    SkillModule,
    LessonModule,
    ExerciseModule,
    LearningModule,
    AiModule,
    NotificationModule,
    HomeModule,
    GamificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global validation pipe
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // Strip non-decorated properties
        forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
        transform: true, // Auto-transform payloads to DTO instances
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },

    // Global auth guard (apply to all routes except @Public())
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Global response transformer
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
