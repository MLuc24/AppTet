import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type StreakRecord = {
  userId: string;
  currentDays: number;
  longestDays: number;
  freezeCount: number;
  lastActivityDate?: Date;
};

@Injectable()
export class StreakRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<StreakRecord | null> {
    const streak = await this.prisma.streaks.findUnique({
      where: { user_id: userId },
    });

    if (!streak) {
      return null;
    }

    return {
      userId: streak.user_id,
      currentDays: streak.current_streak_days ?? 0,
      longestDays: streak.longest_streak_days ?? 0,
      freezeCount: streak.freeze_count ?? 0,
      lastActivityDate: streak.last_activity_date ?? undefined,
    };
  }
}
