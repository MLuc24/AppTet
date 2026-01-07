/**
 * User Repository Implementation with Prisma
 * Infrastructure layer - implements IUserRepository port
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '.prisma/client';
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
    const user = await this.prisma.user.findUnique({ where: { userId } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    return user ? this.toDomain(user) : null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        avatarAssetId: data.avatarAssetId,
        status: data.status || UserStatus.ACTIVE,
        dob: data.dob,
        nativeLanguageId: data.nativeLanguageId,
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
      updateData.passwordHash = data.passwordHash;
    if (data.displayName !== undefined)
      updateData.displayName = data.displayName;
    if (data.avatarAssetId !== undefined)
      updateData.avatarAssetId = data.avatarAssetId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dob !== undefined) updateData.dob = data.dob;
    if (data.nativeLanguageId !== undefined)
      updateData.nativeLanguageId = data.nativeLanguageId;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.lastLoginAt !== undefined)
      updateData.lastLoginAt = data.lastLoginAt;

    const user = await this.prisma.user.update({
      where: { userId },
      data: updateData,
    });
    return this.toDomain(user);
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { userId } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { phone } });
    return count > 0;
  }

  // Mapper: Prisma model → Domain entity
  private toDomain(prismaUser: PrismaUser): UserEntity {
    return new UserEntity({
      userId: prismaUser.userId,
      email: prismaUser.email || undefined,
      phone: prismaUser.phone || undefined,
      passwordHash: prismaUser.passwordHash,
      displayName: prismaUser.displayName,
      avatarAssetId: prismaUser.avatarAssetId || undefined,
      status: prismaUser.status as UserStatus,
      dob: prismaUser.dob || undefined,
      nativeLanguageId: prismaUser.nativeLanguageId || undefined,
      timezone: prismaUser.timezone,
      lastLoginAt: prismaUser.lastLoginAt || undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
