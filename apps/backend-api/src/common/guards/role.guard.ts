/**
 * Role Guard
 * Checks if authenticated user has required roles
 * Usage: @UseGuards(AuthGuard, RoleGuard) @Roles('ADMIN')
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    interface RequestWithUser {
      user?: {
        role?: string;
        roles?: Array<string | { code?: string }>;
      };
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const rawRoles = user.roles
      ? user.roles
      : user.role
        ? [user.role]
        : [];
    const normalizedRoles = rawRoles
      .map((role) =>
        typeof role === 'string'
          ? role
          : role && typeof role.code === 'string'
            ? role.code
            : null,
      )
      .filter((role): role is string => !!role);

    const hasRole = requiredRoles.some((role) => normalizedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
