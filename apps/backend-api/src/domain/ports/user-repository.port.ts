/**
 * User Repository Port (Interface)
 * Domain layer defines what it needs, infrastructure implements it
 */

import { UserEntity, UserStatus } from '../entities/user.entity';

export interface CreateUserData {
  email?: string;
  phone?: string;
  passwordHash: string;
  displayName: string;
  avatarAssetId?: string;
  emailVerificationToken?: string;
  status?: UserStatus;
  dob?: Date;
  nativeLanguageId?: number;
  timezone?: string;
}

export interface UpdateUserData {
  email?: string;
  phone?: string;
  passwordHash?: string;
  displayName?: string;
  avatarAssetId?: string;
  emailVerificationToken?: string;
  status?: UserStatus;
  dob?: Date;
  nativeLanguageId?: number;
  timezone?: string;
  lastLoginAt?: Date;
}

export interface IUserRepository {
  // Query methods
  findById(userId: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByPhone(phone: string): Promise<UserEntity | null>;

  // Command methods
  create(data: CreateUserData): Promise<UserEntity>;
  update(userId: string, data: UpdateUserData): Promise<UserEntity>;
  delete(userId: string): Promise<void>;

  // Check methods
  existsByEmail(email: string): Promise<boolean>;
  existsByPhone(phone: string): Promise<boolean>;
}
