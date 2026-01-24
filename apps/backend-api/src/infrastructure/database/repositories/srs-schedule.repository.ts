/**
 * SRS Schedule Repository Implementation
 * Manages spaced repetition schedules
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface SRSSchedule {
  srsScheduleId: string;
  userId: string;
  itemId: string;
  stage: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: Date | null;
  lastReviewAt: Date | null;
}

@Injectable()
export class SRSScheduleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserAndItem(
    userId: string,
    itemId: string,
  ): Promise<SRSSchedule | null> {
    const schedule = await this.prisma.srs_schedules.findUnique({
      where: {
        user_id_item_id: {
          user_id: userId,
          item_id: itemId,
        },
      },
    });

    if (!schedule) return null;

    return {
      srsScheduleId: schedule.srs_schedule_id,
      userId: schedule.user_id,
      itemId: schedule.item_id,
      stage: schedule.stage ?? 0,
      intervalDays: schedule.interval_days ?? 1,
      easeFactor: Number(schedule.ease_factor ?? 2.5),
      nextReviewAt: schedule.next_review_at,
      lastReviewAt: schedule.last_review_at,
    };
  }

  async upsert(data: {
    userId: string;
    itemId: string;
    stage: number;
    intervalDays: number;
    easeFactor: number;
    nextReviewAt: Date;
  }): Promise<SRSSchedule> {
    const schedule = await this.prisma.srs_schedules.upsert({
      where: {
        user_id_item_id: {
          user_id: data.userId,
          item_id: data.itemId,
        },
      },
      create: {
        user_id: data.userId,
        item_id: data.itemId,
        stage: data.stage,
        interval_days: data.intervalDays,
        ease_factor: data.easeFactor,
        next_review_at: data.nextReviewAt,
        last_review_at: new Date(),
      },
      update: {
        stage: data.stage,
        interval_days: data.intervalDays,
        ease_factor: data.easeFactor,
        next_review_at: data.nextReviewAt,
        last_review_at: new Date(),
      },
    });

    return {
      srsScheduleId: schedule.srs_schedule_id,
      userId: schedule.user_id,
      itemId: schedule.item_id,
      stage: schedule.stage ?? 0,
      intervalDays: schedule.interval_days ?? 1,
      easeFactor: Number(schedule.ease_factor ?? 2.5),
      nextReviewAt: schedule.next_review_at,
      lastReviewAt: schedule.last_review_at,
    };
  }
}
