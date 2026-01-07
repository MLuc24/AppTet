/**
 * User Repository Implementation with Prisma
 * Infrastructure layer - implements IUserRepository port
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '../../../domain/ports/user-repository.port';
import {
  UserEntity,
  UserRole,
  AuthProvider,
} from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByUsername(_username: string): Promise<UserEntity | null> {
    // Username không có trong schema hiện tại
    return null;
  }

  async findByEmailVerifyToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
    return user ? this.toDomain(user) : null;
  }

  async findByPasswordResetToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
    return user ? this.toDomain(user) : null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByProviderId(
    _provider: string,
    _providerId: string,
  ): Promise<UserEntity | null> {
    // ProviderId không có trong schema hiện tại
    return null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        provider: data.provider || 'LOCAL',
        emailVerificationToken: data.emailVerifyToken,
        emailVerified: data.emailVerified || false,
        role: data.role || 'STUDENT',
      },
    });
    return this.toDomain(user);
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    const updateData: Record<string, unknown> = {};

    if (data.passwordHash !== undefined)
      updateData.passwordHash = data.passwordHash;
    if (data.emailVerified !== undefined)
      updateData.emailVerified = data.emailVerified;
    if (data.emailVerifyToken !== undefined)
      updateData.emailVerificationToken = data.emailVerifyToken;
    if (data.passwordResetToken !== undefined)
      updateData.passwordResetToken = data.passwordResetToken;
    if (data.passwordResetExpiry !== undefined)
      updateData.passwordResetTokenExpires = data.passwordResetExpiry;
    if (data.lastLoginAt !== undefined)
      updateData.lastLoginAt = data.lastLoginAt;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async existsByUsername(_username: string): Promise<boolean> {
    // Username không có trong schema hiện tại
    return false;
  }

  // Mapper: Prisma model → Domain entity
  private toDomain(prismaUser: PrismaUser): UserEntity {
    return new UserEntity({
      id: prismaUser.id,
      email: prismaUser.email,
      username: undefined,
      passwordHash: prismaUser.passwordHash || undefined,
      firstName: undefined,
      lastName: undefined,
      avatar: undefined,
      role: prismaUser.role as UserRole,
      provider: prismaUser.provider as AuthProvider,
      providerId: undefined,
      emailVerified: prismaUser.emailVerified,
      emailVerifyToken: prismaUser.emailVerificationToken || undefined,
      passwordResetToken: prismaUser.passwordResetToken || undefined,
      passwordResetExpiry: prismaUser.passwordResetTokenExpires || undefined,
      lastLoginAt: prismaUser.lastLoginAt || undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
