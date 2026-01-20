/**
 * Unit Module
 * Wires together unit-related controllers, services, and repositories
 */

import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AdminUnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { UnitRepository } from '../../infrastructure/database/repositories/unit.repository';
import { CourseVersionRepository } from '../../infrastructure/database/repositories/course-version.repository';
import { UNIT_REPOSITORY } from './unit.types';
import { COURSE_VERSION_REPOSITORY } from '../course/course.types';

@Module({
  controllers: [AdminUnitController],
  providers: [
    UnitService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    {
      provide: UNIT_REPOSITORY,
      useClass: UnitRepository,
    },
    {
      provide: COURSE_VERSION_REPOSITORY,
      useClass: CourseVersionRepository,
    },
  ],
  exports: [UnitService, UNIT_REPOSITORY],
})
export class UnitModule {}
