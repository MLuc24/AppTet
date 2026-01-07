/**
 * RefreshToken Repository Port (Interface)
 */

import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export abstract class IRefreshTokenRepository {
  abstract create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity>;
  abstract findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshTokenEntity | null>;
  abstract findByUserId(userId: string): Promise<RefreshTokenEntity[]>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract deleteByTokenHash(tokenHash: string): Promise<void>;
  abstract deleteExpired(): Promise<number>;
}
