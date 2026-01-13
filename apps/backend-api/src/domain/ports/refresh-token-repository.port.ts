/**
 * RefreshToken Repository Port (Interface)
 */

import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface CreateRefreshTokenData {
  sessionId: string;
  tokenHash: string;
  expiresAt: Date;
}

export abstract class IRefreshTokenRepository {
  abstract create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity>;
  abstract findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshTokenEntity | null>;
  abstract findBySessionId(sessionId: string): Promise<RefreshTokenEntity[]>;
  abstract revoke(refreshTokenId: string): Promise<void>;
  abstract revokeAllBySessionId(sessionId: string): Promise<void>;
  abstract revokeAllByUserId(userId: string): Promise<void>;
  abstract deleteExpired(): Promise<number>;
}
