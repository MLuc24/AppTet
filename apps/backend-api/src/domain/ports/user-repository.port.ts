/**
 * User Repository Port (Interface)
 * Domain không phụ thuộc vào implementation cụ thể
 */

import { UserEntity } from '../entities/user.entity';

export interface CreateUserData {
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  provider?: 'LOCAL' | 'GOOGLE';
  providerId?: string;
  emailVerifyToken?: string;
  emailVerified?: boolean;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface UpdateUserData {
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  emailVerified?: boolean;
  emailVerifyToken?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  lastLoginAt?: Date;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export abstract class IUserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByUsername(username: string): Promise<UserEntity | null>;
  abstract findByEmailVerifyToken(token: string): Promise<UserEntity | null>;
  abstract findByPasswordResetToken(token: string): Promise<UserEntity | null>;
  abstract findByProviderId(
    provider: string,
    providerId: string,
  ): Promise<UserEntity | null>;
  abstract create(data: CreateUserData): Promise<UserEntity>;
  abstract update(id: string, data: UpdateUserData): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract existsByUsername(username: string): Promise<boolean>;
}
