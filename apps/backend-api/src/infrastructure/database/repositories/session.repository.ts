/**
 * Session Repository Implementation with Prisma
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, AuthSession as PrismaSession } from '.prisma/client';
import {
  ISessionRepository,
  CreateSessionData,
} from '../../../domain/ports/session-repository.port';
import { SessionEntity } from '../../../domain/entities/session.entity';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(sessionId: string): Promise<SessionEntity | null> {
    const session = await this.prisma.authSession.findUnique({
      where: { sessionId },
    });
    return session ? this.toDomain(session) : null;
  }

  async findByAccessTokenHash(
    tokenHash: string,
  ): Promise<SessionEntity | null> {
    const session = await this.prisma.authSession.findFirst({
      where: { accessTokenHash: tokenHash },
    });
    return session ? this.toDomain(session) : null;
  }

  async findActiveByUserId(userId: string): Promise<SessionEntity[]> {
    const sessions = await this.prisma.authSession.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    return sessions.map((s) => this.toDomain(s));
  }

  async create(data: CreateSessionData): Promise<SessionEntity> {
    const session = await this.prisma.authSession.create({
      data: {
        userId: data.userId,
        deviceId: data.deviceId,
        accessTokenHash: data.accessTokenHash,
        ip: data.ip,
        userAgent: data.userAgent,
        expiresAt: data.expiresAt,
      },
    });
    return this.toDomain(session);
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.authSession.update({
      where: { sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.authSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }

  private toDomain(prismaSession: PrismaSession): SessionEntity {
    return new SessionEntity({
      sessionId: prismaSession.sessionId,
      userId: prismaSession.userId,
      deviceId: prismaSession.deviceId || undefined,
      accessTokenHash: prismaSession.accessTokenHash,
      ip: prismaSession.ip || undefined,
      userAgent: prismaSession.userAgent || undefined,
      expiresAt: prismaSession.expiresAt,
      revokedAt: prismaSession.revokedAt || undefined,
      createdAt: prismaSession.createdAt,
    });
  }
}
