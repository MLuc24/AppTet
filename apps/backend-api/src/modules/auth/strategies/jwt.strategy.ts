/**
 * JWT Strategy for Passport
 * Validates JWT access tokens
 */

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../../domain/ports/user-repository.port';
import { IRoleRepository } from '../../../domain/ports/role-repository.port';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '../auth.constants';

export interface JwtPayload {
  sub: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<{
    userId: string;
    email?: string;
    phone?: string;
    roles: string[];
  }> {
    // Validate user still exists
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roles = await this.roleRepository.getUserRoles(user.userId);

    // Attach user info to request
    return {
      userId: payload.sub,
      email: payload.email,
      phone: payload.phone,
      roles: roles.map((role) => role.code),
    };
  }
}
