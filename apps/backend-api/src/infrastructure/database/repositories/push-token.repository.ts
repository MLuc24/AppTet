/**
 * Push Token Repository Implementation with Prisma
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, push_provider } from '@prisma/client';

export interface UpsertPushTokenData {
  deviceId: string;
  token: string;
  provider: push_provider;
}

@Injectable()
export class PushTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: UpsertPushTokenData): Promise<void> {
    await this.prisma.push_tokens.upsert({
      where: { token: data.token },
      update: {
        device_id: data.deviceId,
        provider: data.provider,
        is_active: true,
        last_registered_at: new Date(),
        updated_at: new Date(),
      },
      create: {
        device_id: data.deviceId,
        token: data.token,
        provider: data.provider,
        is_active: true,
        last_registered_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async deactivateByToken(userId: string, token: string): Promise<number> {
    const result = await this.prisma.push_tokens.updateMany({
      where: {
        token,
        user_devices: {
          user_id: userId,
        },
      },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    return result.count;
  }

  async findActiveTokensByUserId(userId: string): Promise<string[]> {
    const tokens = await this.prisma.push_tokens.findMany({
      where: {
        is_active: true,
        user_devices: {
          user_id: userId,
        },
      },
      select: {
        token: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return tokens.map((item) => item.token);
  }
}
