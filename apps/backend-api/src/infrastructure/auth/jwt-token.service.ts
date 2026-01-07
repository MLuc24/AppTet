/**
 * JWT Token Service Implementation
 * Infrastructure layer - implements ITokenService port
 */

import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ITokenService,
  JwtPayload,
  TokenPair,
} from '../../domain/ports/token-service.port';
import {
  InvalidTokenError,
  TokenExpiredError,
} from '../../domain/errors/auth.errors';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiration = this.configService.get(
      'JWT_ACCESS_EXPIRATION',
      '15m',
    );
    this.refreshTokenExpiration = this.configService.get(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      } as any,
      {
        expiresIn: this.accessTokenExpiration,
      } as any,
    );
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      } as any,
      {
        expiresIn: this.refreshTokenExpiration,
      } as any,
    );
  }

  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpirationToSeconds(this.accessTokenExpiration),
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
      }>(token);
      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new TokenExpiredError('Access token has expired');
      }
      throw new InvalidTokenError('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
      }>(token);
      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new TokenExpiredError('Refresh token has expired');
      }
      throw new InvalidTokenError('Invalid refresh token');
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const payload = this.jwtService.decode(token);
      if (!payload || typeof payload === 'string') {
        return null;
      }
      const decoded = payload as { sub: string; email: string; role: string };
      return {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  }

  // Helper: parse expiration string (15m, 7d) to seconds
  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 900;
    }
  }
}
