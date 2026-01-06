import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { CourseModule } from '../modules/course/course.module';
import { LessonModule } from '../modules/lesson/lesson.module';
import { LearningModule } from '../modules/learning/learning.module';
import { AiModule } from '../modules/ai/ai.module';
import { NotificationModule } from '../modules/notification/notification.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CourseModule,
    LessonModule,
    LearningModule,
    AiModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
