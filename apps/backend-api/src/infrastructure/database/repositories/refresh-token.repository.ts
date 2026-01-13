/**
 * Refresh Token Repository Implementation with Prisma
 */

import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  refresh_tokens as PrismaRefreshToken,
} from '@prisma/client';
import {
  IRefreshTokenRepository,
  CreateRefreshTokenData,
} from '../../../domain/ports/refresh-token-repository.port';
import { RefreshTokenEntity } from '../../../domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity> {
    const token = await this.prisma.refresh_tokens.create({
      data: {
        session_id: data.sessionId,
        token_hash: data.tokenHash,
        expires_at: data.expiresAt,
      },
      include: {
        auth_sessions: true,
      },
    });
    return this.toDomain(token);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const token = await this.prisma.refresh_tokens.findUnique({
      where: { token_hash: tokenHash },
      include: {
        auth_sessions: true,
      },
    });
    return token ? this.toDomain(token) : null;
  }

  async findBySessionId(sessionId: string): Promise<RefreshTokenEntity[]> {
    const tokens = await this.prisma.refresh_tokens.findMany({
      where: { session_id: sessionId },
      include: {
        auth_sessions: true,
      },
    });
    return tokens.map((t) => this.toDomain(t));
  }

  async revoke(refreshTokenId: string): Promise<void> {
    await this.prisma.refresh_tokens.update({
      where: { refresh_token_id: refreshTokenId },
      data: { revoked_at: new Date() },
    });
  }

  async revokeAllBySessionId(sessionId: string): Promise<void> {
    await this.prisma.refresh_tokens.updateMany({
      where: { session_id: sessionId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    // Find all sessions for this user, then revoke their tokens
    const sessions = await this.prisma.auth_sessions.findMany({
      where: { user_id: userId },
      select: { session_id: true },
    });

    const sessionIds = sessions.map((s) => s.session_id);

    await this.prisma.refresh_tokens.updateMany({
      where: {
        session_id: { in: sessionIds },
        revoked_at: null,
      },
      data: { revoked_at: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refresh_tokens.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
    return result.count;
  }

  private toDomain(
    prismaToken: PrismaRefreshToken & { auth_sessions?: any },
  ): RefreshTokenEntity {
    return new RefreshTokenEntity({
      id: prismaToken.refresh_token_id,
      sessionId: prismaToken.session_id,
      userId: prismaToken.auth_sessions?.user_id || '',
      tokenHash: prismaToken.token_hash,
      expiresAt: prismaToken.expires_at,
      revokedAt: prismaToken.revoked_at || undefined,
      createdAt: prismaToken.created_at || new Date(),
    });
  }
}
