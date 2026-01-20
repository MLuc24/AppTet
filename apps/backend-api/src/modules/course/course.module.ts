/**
 * Course Module
 * Wires together course-related controllers, services, and repositories
 */

import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CourseController } from './course.controller';
import { AdminCourseController } from './admin-course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from '../../infrastructure/database/repositories/course.repository';
import { CourseVersionRepository } from '../../infrastructure/database/repositories/course-version.repository';
import { COURSE_REPOSITORY, COURSE_VERSION_REPOSITORY } from './course.types';

@Module({
  controllers: [CourseController, AdminCourseController],
  providers: [
    CourseService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseRepository,
    },
    {
      provide: COURSE_VERSION_REPOSITORY,
      useClass: CourseVersionRepository,
    },
  ],
  exports: [CourseService, COURSE_REPOSITORY, COURSE_VERSION_REPOSITORY],
})
export class CourseModule {}
