import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.prisma.notifications.count({
      where: {
        user_id: userId,
        read_at: null,
      },
    });
  }

  async findById(notificationId: string, userId: string) {
    return this.prisma.notifications.findFirst({
      where: {
        notification_id: notificationId,
        user_id: userId,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Date> {
    const now = new Date();
    await this.prisma.notifications.updateMany({
      where: {
        notification_id: notificationId,
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: now,
        status: 'read',
      },
    });
    return now;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notifications.updateMany({
      where: {
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
        status: 'read',
      },
    });
    return result.count;
  }
}
