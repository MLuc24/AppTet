import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type PracticeSessionRecord = {
  sessionId: string;
  lessonId: string;
  startedAt: Date;
  endedAt?: Date;
};

@Injectable()
export class PracticeSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserInRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<PracticeSessionRecord[]> {
    const sessions = await this.prisma.practice_sessions.findMany({
      where: {
        user_id: userId,
        started_at: { gte: start, lt: end },
      },
      orderBy: { started_at: 'asc' },
    });

    return sessions.map((s) => ({
      sessionId: s.session_id,
      lessonId: s.lesson_id,
      startedAt: s.started_at ?? new Date(),
      endedAt: s.ended_at ?? undefined,
    }));
  }
}
