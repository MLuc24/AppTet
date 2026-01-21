/**
 * Exercise Module
 * Wires together exercise-related controllers, services, and repositories
 */

import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  LessonExercisesController,
  ExerciseController,
  SessionController,
  AttemptController,
} from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { ExerciseRepository } from '../../infrastructure/database/repositories/exercise.repository';
import { PracticeSessionRepository } from '../../infrastructure/database/repositories/practice-session.repository';
import { LessonRepository } from '../../infrastructure/database/repositories/lesson.repository';
import { EXERCISE_REPOSITORY, SESSION_REPOSITORY } from './exercise.types';
import { LESSON_REPOSITORY } from '../lesson/lesson.types';

@Module({
  controllers: [
    LessonExercisesController,
    ExerciseController,
    SessionController,
    AttemptController,
  ],
  providers: [
    ExerciseService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    {
      provide: EXERCISE_REPOSITORY,
      useClass: ExerciseRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: PracticeSessionRepository,
    },
    {
      provide: LESSON_REPOSITORY,
      useClass: LessonRepository,
    },
  ],
  exports: [ExerciseService, EXERCISE_REPOSITORY],
})
export class ExerciseModule {}
