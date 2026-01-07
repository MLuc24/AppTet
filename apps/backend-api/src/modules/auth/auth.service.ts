/**
 * Auth Service - Application Layer
 * Orchestrates authentication business logic
 * Không chứa framework-specific code, chỉ gọi domain + infrastructure ports
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { IRefreshTokenRepository } from '../../domain/ports/refresh-token-repository.port';
import { ITokenService } from '../../domain/ports/token-service.port';
import { IHashService } from '../../domain/ports/hash-service.port';
import { IEmailService } from '../../domain/ports/email-service.port';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UserResponseDto,
  AuthTokensResponseDto,
} from './auth.dto';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
  UserNotFoundError,
  EmailNotVerifiedError,
  InvalidTokenError,
  PasswordMismatchError,
} from '../../domain/errors/auth.errors';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { PasswordResetRequestedEvent } from '../../domain/events/password-reset-requested.event';
import { UserLoggedInEvent } from '../../domain/events/user-logged-in.event';
import { AUTH_CONSTANTS } from './auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService,
    private readonly emailService: IEmailService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
  }

  /**
   * Register new user with email/password
   */
  async register(
    dto: RegisterDto,
  ): Promise<{ user: UserResponseDto; message: string }> {
    this.logger.log(`Registering user: ${dto.email}`);

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError('Email is already registered');
    }

    // Hash password
    const passwordHash = await this.hashService.hash(dto.password);

    // Generate email verification token
    const emailVerifyToken = this.hashService.generateToken();

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      provider: 'LOCAL',
      emailVerifyToken,
      emailVerified: false,
      role: 'STUDENT',
    });

    // Send verification email
    const verificationLink = `${this.frontendUrl}/verify-email?token=${emailVerifyToken}`;
    await this.emailService.sendVerificationEmail({
      email: user.email,
      name: user.fullName,
      verificationLink,
    });

    // Emit event (for analytics, etc.)
    const event = new UserRegisteredEvent({
      userId: user.id,
      email: user.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      provider: 'LOCAL',
      registeredAt: new Date(),
    });
    this.logger.debug(`Event emitted: ${JSON.stringify(event.toJSON())}`);

    return {
      user: this.mapUserToResponseDto(user),
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login with email/password
   */
  async login(dto: LoginDto): Promise<AuthTokensResponseDto> {
    this.logger.log(`Login attempt: ${dto.email}`);

    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isPasswordValid = await this.hashService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Check email verified
    if (!user.emailVerified) {
      throw new EmailNotVerifiedError();
    }

    // Update last login
    const updatedUser = await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair({
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    // Hash and store refresh token
    const tokenHash = await this.hashService.hash(tokens.refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_DAYS,
    );

    await this.refreshTokenRepository.create({
      userId: updatedUser.id,
      tokenHash,
      expiresAt,
    });

    // Emit login event
    const event = new UserLoggedInEvent({
      userId: updatedUser.id,
      email: updatedUser.email,
      provider: updatedUser.provider,
      loggedInAt: new Date(),
    });
    this.logger.debug(`Event emitted: ${JSON.stringify(event.toJSON())}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: this.mapUserToResponseDto(updatedUser),
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    this.logger.log(`Verifying email with token`);

    const user = await this.userRepository.findByEmailVerifyToken(token);
    if (!user) {
      throw new InvalidTokenError('Invalid or expired verification token');
    }

    // Update user
    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerifyToken: undefined,
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.fullName);

    return { message: 'Email verified successfully' };
  }

  /**
   * Request password reset
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    this.logger.log(`Password reset requested: ${dto.email}`);

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      // Don't reveal if email exists or not (security)
      return { message: 'If that email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = this.hashService.generateToken();
    const expiry = new Date();
    expiry.setMinutes(
      expiry.getMinutes() + AUTH_CONSTANTS.PASSWORD_RESET_EXPIRY_MINUTES,
    );

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: expiry,
    });

    // Send reset email
    const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      name: user.fullName,
      resetLink,
    });

    // Emit event
    const event = new PasswordResetRequestedEvent({
      userId: user.id,
      email: user.email,
      requestedAt: new Date(),
    });
    this.logger.debug(`Event emitted: ${JSON.stringify(event.toJSON())}`);

    return { message: 'If that email exists, a reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    this.logger.log(`Resetting password with token`);

    const user = await this.userRepository.findByPasswordResetToken(dto.token);
    if (!user || !user.passwordResetExpiry) {
      throw new InvalidTokenError('Invalid or expired reset token');
    }

    // Check if token expired
    if (user.passwordResetExpiry < new Date()) {
      throw new InvalidTokenError('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await this.hashService.hash(dto.newPassword);

    // Update user
    await this.userRepository.update(user.id, {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
    });

    // Invalidate all refresh tokens (force re-login)
    await this.refreshTokenRepository.deleteByUserId(user.id);

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email, user.fullName);

    return { message: 'Password reset successfully' };
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    this.logger.log(`Changing password for user: ${userId}`);

    const user = await this.userRepository.findById(userId);
    if (!user || !user.passwordHash) {
      throw new UserNotFoundError();
    }

    // Verify current password
    const isCurrentPasswordValid = await this.hashService.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new PasswordMismatchError();
    }

    // Hash new password
    const passwordHash = await this.hashService.hash(dto.newPassword);

    // Update user
    await this.userRepository.update(user.id, { passwordHash });

    // Invalidate all refresh tokens
    await this.refreshTokenRepository.deleteByUserId(user.id);

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email, user.fullName);

    return { message: 'Password changed successfully' };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    this.logger.log(`Refreshing access token`);

    // Verify refresh token
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    // Check if token hash exists in DB
    const tokenHash = await this.hashService.hash(refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.isExpired()) {
      throw new InvalidTokenError('Invalid or expired refresh token');
    }

    // Generate new access token
    const accessToken = await this.tokenService.generateAccessToken(payload);

    return {
      accessToken,
      expiresIn: 900, // 15 minutes
    };
  }

  /**
   * Logout (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    this.logger.log(`Logging out user`);

    const tokenHash = await this.hashService.hash(refreshToken);
    await this.refreshTokenRepository.deleteByTokenHash(tokenHash);

    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return this.mapUserToResponseDto(user);
  }

  // Helper: Map UserEntity to UserResponseDto
  private mapUserToResponseDto(user: UserEntity): UserResponseDto {
    const publicUser = user.toPublicObject();
    return {
      id: publicUser.id,
      email: publicUser.email,
      username: publicUser.username,
      firstName: publicUser.firstName,
      lastName: publicUser.lastName,
      fullName: publicUser.fullName,
      avatar: publicUser.avatar,
      role: publicUser.role,
      provider: publicUser.provider,
      emailVerified: publicUser.emailVerified,
      lastLoginAt: publicUser.lastLoginAt,
      createdAt: publicUser.createdAt,
    };
  }
}
