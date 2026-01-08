/**
 * Role Repository Port (Interface)
 */

import { RoleEntity } from '../entities/role.entity';

export interface IRoleRepository {
  findById(roleId: number): Promise<RoleEntity | null>;
  findByCode(code: string): Promise<RoleEntity | null>;
  findAll(): Promise<RoleEntity[]>;
  assignRoleToUser(userId: string, roleId: number): Promise<void>;
  removeRoleFromUser(userId: string, roleId: number): Promise<void>;
  getUserRoles(userId: string): Promise<RoleEntity[]>;
}
