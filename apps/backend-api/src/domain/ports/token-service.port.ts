/**
 * Token Service Port (Interface)
 * JWT generation and validation
 */

export interface JwtPayload {
  sub: string; // user ID (userId)
  email?: string;
  phone?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export abstract class ITokenService {
  /**
   * Generate access token (short-lived)
   */
  abstract generateAccessToken(payload: JwtPayload): Promise<string>;

  /**
   * Generate refresh token (long-lived)
   */
  abstract generateRefreshToken(payload: JwtPayload): Promise<string>;

  /**
   * Generate both access and refresh tokens
   */
  abstract generateTokenPair(payload: JwtPayload): Promise<TokenPair>;

  /**
   * Verify access token
   */
  abstract verifyAccessToken(token: string): Promise<JwtPayload>;

  /**
   * Verify refresh token
   */
  abstract verifyRefreshToken(token: string): Promise<JwtPayload>;

  /**
   * Decode token without verification (for debugging)
   */
  abstract decodeToken(token: string): JwtPayload | null;
}
