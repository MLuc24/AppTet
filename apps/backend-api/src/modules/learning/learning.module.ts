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
  PRACTICE_SESSION_REPOSITORY,
  REVIEW_QUEUE_REPOSITORY,
  XP_LEDGER_REPOSITORY,
  STREAK_REPOSITORY,
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
import { PracticeSessionRepository } from '../../infrastructure/database/repositories/practice-session.repository';
import { ReviewQueueRepository } from '../../infrastructure/database/repositories/review-queue.repository';
import { XpLedgerRepository } from '../../infrastructure/database/repositories/xp-ledger.repository';
import { StreakRepository } from '../../infrastructure/database/repositories/streak.repository';

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
    {
      provide: PRACTICE_SESSION_REPOSITORY,
      useClass: PracticeSessionRepository,
    },
    {
      provide: REVIEW_QUEUE_REPOSITORY,
      useClass: ReviewQueueRepository,
    },
    {
      provide: XP_LEDGER_REPOSITORY,
      useClass: XpLedgerRepository,
    },
    {
      provide: STREAK_REPOSITORY,
      useClass: StreakRepository,
    },
  ],
  exports: [
    LearningService,
    ENROLLMENT_REPOSITORY,
    LESSON_PROGRESS_REPOSITORY,
    PRACTICE_SESSION_REPOSITORY,
    REVIEW_QUEUE_REPOSITORY,
    XP_LEDGER_REPOSITORY,
    STREAK_REPOSITORY,
  ],
})
export class LearningModule {}
