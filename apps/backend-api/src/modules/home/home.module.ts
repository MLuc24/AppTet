import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { UserModule } from '../user/user.module';
import { CourseModule } from '../course/course.module';
import { LessonModule } from '../lesson/lesson.module';
import { LearningModule } from '../learning/learning.module';
import { StreakRepository } from '../../infrastructure/database/repositories/streak.repository';
import { NotificationRepository } from '../../infrastructure/database/repositories/notification.repository';

@Module({
  imports: [UserModule, CourseModule, LessonModule, LearningModule],
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    StreakRepository,
    NotificationRepository,
  ],
})
export class HomeModule {}
