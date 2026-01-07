/**
 * Auth Service - Application Layer
 * Orchestrates authentication business logic
 */

import { Injectable, Logger, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { IRoleRepository } from '../../domain/ports/role-repository.port';
import { ISessionRepository } from '../../domain/ports/session-repository.port';
import { ITokenService } from '../../domain/ports/token-service.port';
import { IHashService } from '../../domain/ports/hash-service.port';
import {
  RegisterDto,
  LoginDto,
  UserResponseDto,
  AuthTokensResponseDto,
} from './auth.dto';
import {
  USER_REPOSITORY,
  ROLE_REPOSITORY,
  SESSION_REPOSITORY,
  TOKEN_SERVICE,
  HASH_SERVICE,
} from './auth.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    @Inject(HASH_SERVICE)
    private readonly hashService: IHashService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register new user
   */
  async register(
    dto: RegisterDto,
  ): Promise<{ user: UserResponseDto; message: string }> {
    this.logger.log(`Registering user: ${dto.email || dto.phone}`);

    // Validate: at least email or phone required
    if (!dto.email && !dto.phone) {
      throw new ConflictException('Email or phone is required');
    }

    // Check if email/phone already exists
    if (dto.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('Email is already registered');
      }
    }

    if (dto.phone) {
      const existingUser = await this.userRepository.findByPhone(dto.phone);
      if (existingUser) {
        throw new ConflictException('Phone is already registered');
      }
    }

    // Hash password
    const passwordHash = await this.hashService.hash(dto.password);

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      displayName: dto.displayName,
    });

    // Assign default role (STUDENT)
    const studentRole = await this.roleRepository.findByCode('STUDENT');
    if (studentRole) {
      await this.roleRepository.assignRoleToUser(user.userId, studentRole.roleId);
    }

    return {
      user: this.mapUserToResponse(user.toPublicObject()),
      message: 'Registration successful',
    };
  }

  /**
   * Login with email/phone and password
   */
  async login(dto: LoginDto): Promise<AuthTokensResponseDto> {
    this.logger.log(`Login attempt: ${dto.email || dto.phone}`);

    // Validate: at least email or phone required
    if (!dto.email && !dto.phone) {
      throw new UnauthorizedException('Email or phone is required');
    }

    // Find user
    let user;
    if (dto.email) {
      user = await this.userRepository.findByEmail(dto.email);
    } else if (dto.phone) {
      user = await this.userRepository.findByPhone(dto.phone);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive()) {
      throw new UnauthorizedException('Account is suspended or deleted');
    }

    // Verify password
    const isPasswordValid = await this.hashService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    const updatedUser = user.updateLastLogin();
    await this.userRepository.update(user.userId, {
      lastLoginAt: updatedUser.lastLoginAt,
    });

    // Generate tokens
    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.userId,
      email: user.email,
      phone: user.phone,
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: user.userId,
    });

    // Create session
    const accessTokenHash = await this.hashService.hash(accessToken);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes

    await this.sessionRepository.create({
      userId: user.userId,
      accessTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: this.mapUserToResponse(updatedUser.toPublicObject()),
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);

      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive()) {
        throw new UnauthorizedException('Invalid token');
      }

      const accessToken = await this.tokenService.generateAccessToken({
        sub: user.userId,
        email: user.email,
        phone: user.phone,
      });

      return {
        accessToken,
        expiresIn: 900,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout - revoke session
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    // In a real implementation, you would:
    // 1. Verify the refresh token
    // 2. Find and revoke the associated session
    // For now, just return success
    return { message: 'Logged out successfully' };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.mapUserToResponse(user.toPublicObject());
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    dto: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.hashService.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.hashService.hash(dto.newPassword);

    // Update password
    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });

    // Revoke all sessions for security
    await this.sessionRepository.revokeAllByUserId(userId);

    return { message: 'Password changed successfully' };
  }

  // Helper methods
  private mapUserToResponse(user: any): UserResponseDto {
    return {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      avatarAssetId: user.avatarAssetId,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  // Placeholder methods for compatibility
  async verifyEmail(token: string): Promise<{ message: string }> {
    return { message: 'Email verification not implemented yet' };
  }

  async forgotPassword(dto: any): Promise<{ message: string }> {
    return { message: 'Password reset email sent if email exists' };
  }

  async resetPassword(dto: any): Promise<{ message: string }> {
    return { message: 'Password reset not implemented yet' };
  }
}
