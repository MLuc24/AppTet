/**
 * Auth Service - Application Layer
 * Orchestrates authentication business logic
 */

<<<<<<< HEAD
<<<<<<< HEAD
import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { createHash } from 'crypto';
=======
import { Injectable, Logger, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
>>>>>>> parent of e0e1036 (feat(auth): Add email existence check endpoint for password reset flow)
=======
import { Injectable, Logger, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
>>>>>>> parent of 32db27e (Merge branch 'Auth' of https://github.com/MLuc24/AppTet into Auth)
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { IRoleRepository } from '../../domain/ports/role-repository.port';
import { ISessionRepository } from '../../domain/ports/session-repository.port';
import { ITokenService } from '../../domain/ports/token-service.port';
import { IHashService } from '../../domain/ports/hash-service.port';
import { IEmailService } from '../../domain/ports/email-service.port';
import {
  RegisterDto,
  LoginDto,
  UserResponseDto,
  AuthTokensResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.dto';
import {
  USER_REPOSITORY,
  ROLE_REPOSITORY,
  SESSION_REPOSITORY,
  TOKEN_SERVICE,
  HASH_SERVICE,
  EMAIL_SERVICE,
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
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register new user
   */
  async register(
    dto: RegisterDto,
<<<<<<< HEAD
    ip?: string,
    userAgent?: string,
=======
>>>>>>> parent of 32db27e (Merge branch 'Auth' of https://github.com/MLuc24/AppTet into Auth)
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

    const emailVerificationToken = dto.email
      ? this.hashService.generateToken()
      : undefined;

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      displayName: dto.displayName,
      emailVerificationToken,
    });

    // Assign default role (STUDENT)
    const studentRole = await this.roleRepository.findByCode('STUDENT');
    if (studentRole) {
      await this.roleRepository.assignRoleToUser(user.userId, studentRole.roleId);
<<<<<<< HEAD
    }

    // Create device if device info provided
    if (dto.platform) {
      const deviceFingerprint = dto.deviceModel || dto.osVersion
        ? DeviceEntity.generateFingerprint(dto.platform, dto.deviceModel, dto.osVersion)
        : undefined;

      await this.deviceRepository.create({
        userId: user.userId,
        platform: dto.platform,
        deviceModel: dto.deviceModel,
        osVersion: dto.osVersion,
        appVersion: dto.appVersion,
        deviceFingerprint,
        locale: dto.locale,
      });

      this.logger.log(`Device registered for user ${user.userId}: ${dto.platform}`);
=======
>>>>>>> parent of 32db27e (Merge branch 'Auth' of https://github.com/MLuc24/AppTet into Auth)
    }

    if (user.email && emailVerificationToken) {
      try {
        await this.emailService.sendVerificationEmail({
          email: user.email,
          name: user.displayName,
          token: emailVerificationToken,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send verification email to ${user.email}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
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

<<<<<<< HEAD
    // Handle device registration/update
    let deviceId: string | undefined;
    if (dto.platform) {
      const deviceFingerprint = dto.deviceModel || dto.osVersion
        ? DeviceEntity.generateFingerprint(dto.platform, dto.deviceModel, dto.osVersion)
        : undefined;

      // Try to find existing device by fingerprint
      let device = deviceFingerprint
        ? await this.deviceRepository.findByFingerprint(user.userId, deviceFingerprint)
        : null;

      if (device) {
        // Update existing device
        device = await this.deviceRepository.update(device.id, {
          deviceModel: dto.deviceModel,
          osVersion: dto.osVersion,
          appVersion: dto.appVersion,
          locale: dto.locale,
        });
        this.logger.log(`Device updated for user ${user.userId}: ${device.id}`);
      } else {
        // Create new device
        device = await this.deviceRepository.create({
          userId: user.userId,
          platform: dto.platform,
          deviceModel: dto.deviceModel,
          osVersion: dto.osVersion,
          appVersion: dto.appVersion,
          deviceFingerprint,
          locale: dto.locale,
        });
        this.logger.log(`New device registered for user ${user.userId}: ${device.id}`);
      }

      deviceId = device.id;
    }

=======
>>>>>>> parent of 32db27e (Merge branch 'Auth' of https://github.com/MLuc24/AppTet into Auth)
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

<<<<<<< HEAD
    // Save refresh token to database
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.create({
      sessionId: session.sessionId,
      tokenHash: refreshTokenHash,
      expiresAt: refreshExpiresAt,
    });

    this.logger.log(`Login successful for user ${user.userId}, session ${session.sessionId}`);

=======
>>>>>>> parent of 32db27e (Merge branch 'Auth' of https://github.com/MLuc24/AppTet into Auth)
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

<<<<<<< HEAD
      // Verify the refresh token exists in database and is valid
<<<<<<< HEAD
      const refreshTokenHash = this.hashToken(refreshToken);
      const storedToken =
        await this.refreshTokenRepository.findByTokenHash(refreshTokenHash);
=======
      const refreshTokenHash = await this.hashService.hash(refreshToken);
      const storedToken = await this.refreshTokenRepository.findByTokenHash(refreshTokenHash);
>>>>>>> parent of e0e1036 (feat(auth): Add email existence check endpoint for password reset flow)

      if (!storedToken || !storedToken.isValid()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Verify user still exists and is active
=======
>>>>>>> parent of 32db27e (Merge branch 'Auth' of https://github.com/MLuc24/AppTet into Auth)
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
<<<<<<< HEAD
    try {
      // Hash the refresh token to find it in database
<<<<<<< HEAD
      const tokenHash = this.hashToken(refreshToken);
      const storedToken =
        await this.refreshTokenRepository.findByTokenHash(tokenHash);
=======
      const tokenHash = await this.hashService.hash(refreshToken);
      const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
>>>>>>> parent of e0e1036 (feat(auth): Add email existence check endpoint for password reset flow)

      if (storedToken) {
        // Revoke the refresh token
        await this.refreshTokenRepository.revoke(storedToken.id);

        // Revoke the associated session
        await this.sessionRepository.revoke(storedToken.sessionId);

        this.logger.log(`Logout successful, session ${storedToken.sessionId} revoked`);
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error('Logout error:', error);
      // Don't throw error on logout, just return success
      return { message: 'Logged out successfully' };
    }
=======
    // In a real implementation, you would:
    // 1. Verify the refresh token
    // 2. Find and revoke the associated session
    // For now, just return success
    return { message: 'Logged out successfully' };
>>>>>>> parent of 32db27e (Merge branch 'Auth' of https://github.com/MLuc24/AppTet into Auth)
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
  async verifyEmail(
    token: string,
    email?: string,
  ): Promise<{ status: 'verified' | 'already_verified' | 'invalid' }> {
    if (!token && !email) {
      return { status: 'invalid' };
    }

    if (token) {
      const user = await this.userRepository.findByEmailVerificationToken(token);
      if (user) {
        if (user.emailVerified) {
          return { status: 'already_verified' };
        }

        await this.userRepository.update(user.userId, {
          emailVerificationToken: null,
          emailVerified: true,
        });

        if (user.email) {
          try {
            await this.emailService.sendWelcomeEmail({
              email: user.email,
              name: user.displayName,
            });
          } catch (error) {
            this.logger.error(
              `Failed to send welcome email to ${user.email}`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        }

        return { status: 'verified' };
      }
    }

    if (email) {
      const userByEmail = await this.userRepository.findByEmail(email);
      if (userByEmail?.emailVerified) {
        return { status: 'already_verified' };
      }
    }

    return { status: 'invalid' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
<<<<<<< HEAD
<<<<<<< HEAD
    // Always return success message for security (prevent email enumeration)
    // But only send email if user exists
    if (user && user.email) {
      const otpCode = this.generateOtpCode();
      const expiresInMinutes = this.getOtpExpiryMinutes();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
=======
    if (!user || !user.email) {
      return { message: 'Password reset email sent if email exists' };
    }
>>>>>>> parent of e0e1036 (feat(auth): Add email existence check endpoint for password reset flow)
=======
    if (!user || !user.email) {
      return { message: 'Password reset email sent if email exists' };
    }
>>>>>>> parent of 32db27e (Merge branch 'Auth' of https://github.com/MLuc24/AppTet into Auth)

    const otpCode = this.generateOtpCode();
    const expiresInMinutes = this.getOtpExpiryMinutes();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    await this.userRepository.update(user.userId, {
      passwordResetOtp: otpCode,
      passwordResetOtpExpiresAt: expiresAt,
    });

    try {
      await this.emailService.sendPasswordResetOtpEmail({
        email: user.email,
        name: user.displayName,
        otpCode,
        expiresInMinutes,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset OTP to ${user.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return { message: 'Password reset email sent if email exists' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const storedOtp = user.passwordResetOtp;
    const expiresAt = user.passwordResetOtpExpiresAt;
    const now = new Date();

    if (
      !storedOtp ||
      !expiresAt ||
      storedOtp !== dto.otpCode ||
      expiresAt <= now
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const newPasswordHash = await this.hashService.hash(dto.newPassword);

    await this.userRepository.update(user.userId, {
      passwordHash: newPasswordHash,
      passwordResetOtp: null,
      passwordResetOtpExpiresAt: null,
    });

    if (user.email) {
      try {
        await this.emailService.sendPasswordChangedEmail({
          email: user.email,
          name: user.displayName,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send password changed email to ${user.email}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return { message: 'Password reset successfully' };
  }

  private generateOtpCode(): string {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }

  private getOtpExpiryMinutes(): number {
    const raw = this.configService.get<string>(
      'RESET_PASSWORD_OTP_EXPIRES_MINUTES',
      '10',
    );
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  }
}
