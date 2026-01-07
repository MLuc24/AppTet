/**
 * Role Repository Implementation with Prisma
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, Role as PrismaRole } from '.prisma/client';
import { IRoleRepository } from '../../../domain/ports/role-repository.port';
import { RoleEntity } from '../../../domain/entities/role.entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(roleId: number): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({ where: { roleId } });
    return role ? this.toDomain(role) : null;
  }

  async findByCode(code: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({ where: { code } });
    return role ? this.toDomain(role) : null;
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany();
    return roles.map((role) => this.toDomain(role));
  }

  async assignRoleToUser(userId: string, roleId: number): Promise<void> {
    await this.prisma.userRole.create({
      data: { userId, roleId },
    });
  }

  async removeRoleFromUser(userId: string, roleId: number): Promise<void> {
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId },
      },
    });
  }

  async getUserRoles(userId: string): Promise<RoleEntity[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => this.toDomain(ur.role));
  }

  private toDomain(prismaRole: PrismaRole): RoleEntity {
    return new RoleEntity({
      roleId: prismaRole.roleId,
      code: prismaRole.code,
      name: prismaRole.name,
      createdAt: prismaRole.createdAt,
      updatedAt: prismaRole.updatedAt,
    });
  }
}
