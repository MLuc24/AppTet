/**
 * RefreshToken Repository Implementation with Prisma
 * Infrastructure layer - implements IRefreshTokenRepository port
 */

import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  RefreshToken as PrismaRefreshToken,
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
    const token = await this.prisma.refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
    return this.toDomain(token);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    return token ? this.toDomain(token) : null;
  }

  async findByUserId(userId: string): Promise<RefreshTokenEntity[]> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return tokens.map((t) => this.toDomain(t));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { tokenHash } });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  // Mapper: Prisma model → Domain entity
  private toDomain(prismaToken: PrismaRefreshToken): RefreshTokenEntity {
    return new RefreshTokenEntity({
      id: prismaToken.id,
      userId: prismaToken.userId,
      tokenHash: prismaToken.tokenHash,
      expiresAt: prismaToken.expiresAt,
      createdAt: prismaToken.createdAt,
    });
  }
}
