/**
 * Auth Module DTOs
 * Request and Response DTOs for authentication endpoints
 */

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============ REQUEST DTOs ============

export class RegisterDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ example: '+84901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Display name is required' })
  @MaxLength(255)
  displayName: string;

  // Device information (optional)
  @ApiPropertyOptional({ example: 'ios', enum: ['ios', 'android'] })
  @IsOptional()
  @IsString()
  platform?: 'ios' | 'android';

  @ApiPropertyOptional({ example: 'iPhone 14 Pro' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceModel?: string;

  @ApiPropertyOptional({ example: '16.0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  osVersion?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  appVersion?: string;

  @ApiPropertyOptional({ example: 'en-US' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}

export class LoginDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ example: '+84901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  // Device information (optional)
  @ApiPropertyOptional({ example: 'ios', enum: ['ios', 'android'] })
  @IsOptional()
  @IsString()
  platform?: 'ios' | 'android';

  @ApiPropertyOptional({ example: 'iPhone 14 Pro' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceModel?: string;

  @ApiPropertyOptional({ example: '16.0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  osVersion?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  appVersion?: string;

  @ApiPropertyOptional({ example: 'en-US' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otpCode: string;

  @ApiProperty({ example: 'NewSecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass123!' })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({ example: 'NewPass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @MaxLength(50, { message: 'New password must not exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'uuid-token-here' })
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}

export class LogoutDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

// ============ RESPONSE DTOs ============

export class UserResponseDto {
  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarAssetId?: string;

  @ApiProperty({ enum: ['active', 'suspended', 'deleted'] })
  status: string;

  @ApiPropertyOptional()
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration in seconds',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class RegisterResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: UserResponseDto })
  data: {
    user: UserResponseDto;
    message: string;
  };
}

export class LoginResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: AuthTokensResponseDto })
  data: AuthTokensResponseDto;
}

export class RefreshTokenResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export class MessageResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    message: string;
  };
}

export class ErrorResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: null;

  @ApiProperty()
  error: {
    code: string;
    message: string;
  };
}
