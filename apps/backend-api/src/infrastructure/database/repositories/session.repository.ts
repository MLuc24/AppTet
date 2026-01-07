/**
 * Session Repository Implementation with Prisma
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, auth_sessions as PrismaSession } from '@prisma/client';
import {
  ISessionRepository,
  CreateSessionData,
} from '../../../domain/ports/session-repository.port';
import { SessionEntity } from '../../../domain/entities/session.entity';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(sessionId: string): Promise<SessionEntity | null> {
    const session = await this.prisma.auth_sessions.findUnique({
      where: { session_id: sessionId },
    });
    return session ? this.toDomain(session) : null;
  }

  async findByAccessTokenHash(
    tokenHash: string,
  ): Promise<SessionEntity | null> {
    const session = await this.prisma.auth_sessions.findFirst({
      where: { access_token_hash: tokenHash },
    });
    return session ? this.toDomain(session) : null;
  }

  async findActiveByUserId(userId: string): Promise<SessionEntity[]> {
    const sessions = await this.prisma.auth_sessions.findMany({
      where: {
        user_id: userId,
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
    });
    return sessions.map((s) => this.toDomain(s));
  }

  async create(data: CreateSessionData): Promise<SessionEntity> {
    const session = await this.prisma.auth_sessions.create({
      data: {
        user_id: data.userId,
        device_id: data.deviceId,
        access_token_hash: data.accessTokenHash,
        ip: data.ip,
        user_agent: data.userAgent,
        expires_at: data.expiresAt,
      },
    });
    return this.toDomain(session);
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.auth_sessions.update({
      where: { session_id: sessionId },
      data: { revoked_at: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.auth_sessions.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.auth_sessions.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
    return result.count;
  }

  private toDomain(prismaSession: PrismaSession): SessionEntity {
    return new SessionEntity({
      sessionId: prismaSession.session_id,
      userId: prismaSession.user_id,
      deviceId: prismaSession.device_id || undefined,
      accessTokenHash: prismaSession.access_token_hash,
      ip: prismaSession.ip || undefined,
      userAgent: prismaSession.user_agent || undefined,
      expiresAt: prismaSession.expires_at,
      revokedAt: prismaSession.revoked_at || undefined,
      createdAt: prismaSession.created_at || new Date(),
    });
  }
}
