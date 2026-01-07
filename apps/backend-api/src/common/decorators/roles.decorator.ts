/**
 * Roles Decorator
 * Marks routes that require specific roles
 * Usage: @Roles('ADMIN', 'INSTRUCTOR')
 */

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
