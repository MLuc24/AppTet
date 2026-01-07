/**
 * Role Repository Implementation with Prisma
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, roles as PrismaRole } from '@prisma/client';
import { IRoleRepository } from '../../../domain/ports/role-repository.port';
import { RoleEntity } from '../../../domain/entities/role.entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(roleId: number): Promise<RoleEntity | null> {
    const role = await this.prisma.roles.findUnique({ where: { role_id: roleId } });
    return role ? this.toDomain(role) : null;
  }

  async findByCode(code: string): Promise<RoleEntity | null> {
    const role = await this.prisma.roles.findUnique({ where: { code } });
    return role ? this.toDomain(role) : null;
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.prisma.roles.findMany();
    return roles.map((role) => this.toDomain(role));
  }

  async assignRoleToUser(userId: string, roleId: number): Promise<void> {
    await this.prisma.user_roles.create({
      data: { user_id: userId, role_id: roleId },
    });
  }

  async removeRoleFromUser(userId: string, roleId: number): Promise<void> {
    await this.prisma.user_roles.delete({
      where: {
        user_id_role_id: { user_id: userId, role_id: roleId },
      },
    });
  }

  async getUserRoles(userId: string): Promise<RoleEntity[]> {
    const userRoles = await this.prisma.user_roles.findMany({
      where: { user_id: userId },
      include: { roles: true },
    });
    return userRoles.map((ur) => this.toDomain(ur.roles));
  }

  private toDomain(prismaRole: PrismaRole): RoleEntity {
    return new RoleEntity({
      roleId: prismaRole.role_id,
      code: prismaRole.code,
      name: prismaRole.name,
      createdAt: prismaRole.created_at || new Date(),
      updatedAt: prismaRole.updated_at || new Date(),
    });
  }
}
