import { Injectable, Inject } from '@nestjs/common';
import { PRACTICE_SESSION_REPOSITORY } from '../learning/learning.types';
import { PracticeSessionRepository } from '../../infrastructure/database/repositories/practice-session.repository';
import { StreakRepository } from '../../infrastructure/database/repositories/streak.repository';
import {
  getDateStringInTimeZone,
  getUtcRangeForDate,
  getWeekStartDateString,
} from '../../common/utils/timezone.util';
import { StreakResponseDto } from './gamification.dto';

const DAY_MS = 24 * 60 * 60000;

@Injectable()
export class GamificationService {
  constructor(
    private readonly streakRepository: StreakRepository,
    @Inject(PRACTICE_SESSION_REPOSITORY)
    private readonly practiceSessionRepository: PracticeSessionRepository,
  ) {}

  async getStreak(
    userId: string,
    timeZone: string,
  ): Promise<StreakResponseDto> {
    const now = new Date();
    const todayString = getDateStringInTimeZone(now, timeZone);
    const weekStartString = getWeekStartDateString(todayString);
    const { start: weekStartUtc } = getUtcRangeForDate(
      weekStartString,
      timeZone,
    );
    const weekEndUtc = new Date(weekStartUtc.getTime() + 7 * DAY_MS);

    const [streak, sessions] = await Promise.all([
      this.streakRepository.findByUserId(userId),
      this.practiceSessionRepository.findByUserInRange(
        userId,
        weekStartUtc,
        weekEndUtc,
      ),
    ]);

    const activityDays = new Set(
      sessions.map((session) =>
        getDateStringInTimeZone(session.startedAt, timeZone),
      ),
    );

    const days = [];
    let remainingFreezes = streak?.freezeCount ?? 0;
    for (let i = 0; i < 7; i += 1) {
      const dayDate = new Date(weekStartUtc.getTime() + i * DAY_MS);
      const dateString = getDateStringInTimeZone(dayDate, timeZone);

      let status: 'done' | 'today' | 'missed' | 'future' | 'frozen';
      if (dateString === todayString) {
        status = 'today';
      } else if (dateString < todayString) {
        if (activityDays.has(dateString)) {
          status = 'done';
        } else if (remainingFreezes > 0) {
          status = 'frozen';
          remainingFreezes -= 1;
        } else {
          status = 'missed';
        }
      } else {
        status = 'future';
      }

      days.push({ date: dateString, status });
    }

    return {
      currentDays: streak?.currentDays ?? 0,
      longestDays: streak?.longestDays ?? 0,
      freezeCount: streak?.freezeCount ?? 0,
      lastActivityDate: streak?.lastActivityDate
        ? getDateStringInTimeZone(streak.lastActivityDate, timeZone)
        : null,
      week: {
        startDate: weekStartString,
        endDate: getDateStringInTimeZone(
          new Date(weekStartUtc.getTime() + 6 * DAY_MS),
          timeZone,
        ),
        days,
      },
    };
  }
}
