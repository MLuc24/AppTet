/**
 * Hash Service Port (Interface)
 * Password hashing with bcrypt
 */

export abstract class IHashService {
  /**
   * Hash a plain text password
   */
  abstract hash(plainText: string): Promise<string>;

  /**
   * Compare plain text with hash
   */
  abstract compare(plainText: string, hash: string): Promise<boolean>;

  /**
   * Generate random token for email verification, password reset, etc.
   */
  abstract generateToken(): string;
}
