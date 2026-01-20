/**
 * Skill Module
 * Wires together skill-related controllers, services, and repositories
 */

import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AdminSkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { SkillRepository } from '../../infrastructure/database/repositories/skill.repository';
import { UnitRepository } from '../../infrastructure/database/repositories/unit.repository';
import { SKILL_REPOSITORY } from './skill.types';
import { UNIT_REPOSITORY } from '../unit/unit.types';

@Module({
  controllers: [AdminSkillController],
  providers: [
    SkillService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    {
      provide: SKILL_REPOSITORY,
      useClass: SkillRepository,
    },
    {
      provide: UNIT_REPOSITORY,
      useClass: UnitRepository,
    },
  ],
  exports: [SkillService, SKILL_REPOSITORY],
})
export class SkillModule {}
