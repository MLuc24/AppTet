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
}
