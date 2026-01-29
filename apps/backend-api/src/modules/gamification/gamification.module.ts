import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { LearningModule } from '../learning/learning.module';
import { StreakRepository } from '../../infrastructure/database/repositories/streak.repository';

@Module({
  imports: [LearningModule],
  controllers: [GamificationController],
  providers: [
    GamificationService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    StreakRepository,
  ],
})
export class GamificationModule {}
