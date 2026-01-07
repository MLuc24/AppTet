/**
 * Session Repository Port (Interface)
 */

import { SessionEntity } from '../entities/session.entity';

export interface CreateSessionData {
  userId: string;
  deviceId?: string;
  accessTokenHash: string;
  ip?: string;
  userAgent?: string;
  expiresAt: Date;
}

export interface ISessionRepository {
  findById(sessionId: string): Promise<SessionEntity | null>;
  findByAccessTokenHash(tokenHash: string): Promise<SessionEntity | null>;
  findActiveByUserId(userId: string): Promise<SessionEntity[]>;
  
  create(data: CreateSessionData): Promise<SessionEntity>;
  revoke(sessionId: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
