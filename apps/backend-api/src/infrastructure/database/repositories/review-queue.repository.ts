import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type ReviewQueueItem = {
  reviewQueueId: string;
  itemId: string;
  dueAt: Date;
  priority: number;
  source: string;
};

export type ReviewSummary = {
  dueCount: number;
  overdueCount: number;
  dueTodayCount: number;
  nextDueAt?: Date;
};

@Injectable()
export class ReviewQueueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSummary(
    userId: string,
    startOfDay: Date,
    endOfDay: Date,
    now: Date,
  ): Promise<ReviewSummary> {
    const [dueCount, overdueCount, dueTodayCount, nextDue] =
      await Promise.all([
        this.prisma.review_queue.count({
          where: { user_id: userId, due_at: { lte: now } },
        }),
        this.prisma.review_queue.count({
          where: { user_id: userId, due_at: { lt: startOfDay } },
        }),
        this.prisma.review_queue.count({
          where: {
            user_id: userId,
            due_at: { gte: startOfDay, lt: endOfDay },
          },
        }),
        this.prisma.review_queue.findFirst({
          where: { user_id: userId, due_at: { gt: now } },
          orderBy: { due_at: 'asc' },
          select: { due_at: true },
        }),
      ]);

    return {
      dueCount,
      overdueCount,
      dueTodayCount,
      nextDueAt: nextDue?.due_at ?? undefined,
    };
  }

  async findQueue(
    userId: string,
    skip: number,
    take: number,
    dueBefore?: Date,
  ): Promise<{ items: ReviewQueueItem[]; total: number }> {
    const where: Record<string, unknown> = { user_id: userId };
    if (dueBefore) {
      where.due_at = { lte: dueBefore };
    }

    const [items, total] = await Promise.all([
      this.prisma.review_queue.findMany({
        where,
        orderBy: { due_at: 'asc' },
        skip,
        take,
      }),
      this.prisma.review_queue.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        reviewQueueId: item.review_queue_id,
        itemId: item.item_id,
        dueAt: item.due_at,
        priority: item.priority ?? 0,
        source: item.source,
      })),
      total,
    };
  }
}
