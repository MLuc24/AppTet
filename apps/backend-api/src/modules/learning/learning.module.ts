/**
 * Learning Module
 * Handles enrollment and progress tracking
 */

import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import {
  ENROLLMENT_REPOSITORY,
  LESSON_PROGRESS_REPOSITORY,
} from './learning.types';
import {
  COURSE_REPOSITORY,
  COURSE_VERSION_REPOSITORY,
} from '../course/course.types';
import { LESSON_REPOSITORY } from '../lesson/lesson.types';
import { EnrollmentRepository } from '../../infrastructure/database/repositories/enrollment.repository';
import { LessonProgressRepository } from '../../infrastructure/database/repositories/lesson-progress.repository';
import { CourseRepository } from '../../infrastructure/database/repositories/course.repository';
import { CourseVersionRepository } from '../../infrastructure/database/repositories/course-version.repository';
import { LessonRepository } from '../../infrastructure/database/repositories/lesson.repository';

@Module({
  controllers: [LearningController],
  providers: [
    LearningService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    {
      provide: ENROLLMENT_REPOSITORY,
      useClass: EnrollmentRepository,
    },
    {
      provide: LESSON_PROGRESS_REPOSITORY,
      useClass: LessonProgressRepository,
    },
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseRepository,
    },
    {
      provide: COURSE_VERSION_REPOSITORY,
      useClass: CourseVersionRepository,
    },
    {
      provide: LESSON_REPOSITORY,
      useClass: LessonRepository,
    },
  ],
  exports: [LearningService, ENROLLMENT_REPOSITORY],
})
export class LearningModule {}
