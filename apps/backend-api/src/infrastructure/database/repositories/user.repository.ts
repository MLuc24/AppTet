/**
 * User Repository Implementation with Prisma
 * Infrastructure layer - implements IUserRepository port
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, users as PrismaUser } from '@prisma/client';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '../../../domain/ports/user-repository.port';
import { UserEntity, UserStatus } from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(userId: string): Promise<UserEntity | null> {
    const user = await this.prisma.users.findUnique({ where: { user_id: userId } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this.prisma.users.findUnique({ where: { phone } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmailVerificationToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.users.findUnique({
      where: { email_verification_token: token },
    });
    return user ? this.toDomain(user) : null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.users.create({
      data: {
        email: data.email,
        phone: data.phone,
        password_hash: data.passwordHash,
        display_name: data.displayName,
        avatar_asset_id: data.avatarAssetId,
        email_verification_token: data.emailVerificationToken,
        email_verified: data.emailVerified,
        status: data.status || UserStatus.ACTIVE,
        dob: data.dob,
        native_language_id: data.nativeLanguageId,
        timezone: data.timezone || 'UTC',
      },
    });
    return this.toDomain(user);
  }

  async update(userId: string, data: UpdateUserData): Promise<UserEntity> {
    const updateData: Record<string, unknown> = {};

    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.passwordHash !== undefined)
      updateData.password_hash = data.passwordHash;
    if (data.displayName !== undefined)
      updateData.display_name = data.displayName;
    if (data.avatarAssetId !== undefined)
      updateData.avatar_asset_id = data.avatarAssetId;
    if (data.emailVerificationToken !== undefined)
      updateData.email_verification_token = data.emailVerificationToken;
    if (data.emailVerified !== undefined)
      updateData.email_verified = data.emailVerified;
    if (data.passwordResetOtp !== undefined)
      updateData.password_reset_otp = data.passwordResetOtp;
    if (data.passwordResetOtpExpiresAt !== undefined)
      updateData.password_reset_otp_expires_at =
        data.passwordResetOtpExpiresAt;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dob !== undefined) updateData.dob = data.dob;
    if (data.nativeLanguageId !== undefined)
      updateData.native_language_id = data.nativeLanguageId;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.lastLoginAt !== undefined)
      updateData.last_login_at = data.lastLoginAt;

    const user = await this.prisma.users.update({
      where: { user_id: userId },
      data: updateData,
    });
    return this.toDomain(user);
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.users.delete({ where: { user_id: userId } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.users.count({ where: { email } });
    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.prisma.users.count({ where: { phone } });
    return count > 0;
  }

  // Mapper: Prisma model → Domain entity
  private toDomain(prismaUser: PrismaUser): UserEntity {
    return new UserEntity({
      userId: prismaUser.user_id,
      email: prismaUser.email || undefined,
      phone: prismaUser.phone || undefined,
      passwordHash: prismaUser.password_hash,
      displayName: prismaUser.display_name,
      emailVerified: prismaUser.email_verified ?? false,
      passwordResetOtp: prismaUser.password_reset_otp || undefined,
      passwordResetOtpExpiresAt:
        prismaUser.password_reset_otp_expires_at || undefined,
      avatarAssetId: prismaUser.avatar_asset_id || undefined,
      status: prismaUser.status as UserStatus,
      dob: prismaUser.dob || undefined,
      nativeLanguageId: prismaUser.native_language_id || undefined,
      timezone: prismaUser.timezone || 'UTC',
      lastLoginAt: prismaUser.last_login_at || undefined,
      createdAt: prismaUser.created_at || new Date(),
      updatedAt: prismaUser.updated_at || new Date(),
    });
  }
}
