/**
 * Lesson Module
 * Wires together lesson-related controllers, services, and repositories
 */

import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LessonController, SkillLessonsController } from './lesson.controller';
import { AdminLessonController } from './admin-lesson.controller';
import { LessonService } from './lesson.service';
import { LessonRepository } from '../../infrastructure/database/repositories/lesson.repository';
import { SkillRepository } from '../../infrastructure/database/repositories/skill.repository';
import { LESSON_REPOSITORY } from './lesson.types';
import { SKILL_REPOSITORY } from '../skill/skill.types';

@Module({
  controllers: [
    LessonController,
    SkillLessonsController,
    AdminLessonController,
  ],
  providers: [
    LessonService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    {
      provide: LESSON_REPOSITORY,
      useClass: LessonRepository,
    },
    {
      provide: SKILL_REPOSITORY,
      useClass: SkillRepository,
    },
  ],
  exports: [LessonService, LESSON_REPOSITORY],
})
export class LessonModule {}
