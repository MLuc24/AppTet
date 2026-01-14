/**
 * User Module DTOs
 * Request and response DTOs for user endpoints
 */

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../../domain/entities/user.entity';

export class UpdateUserSettingsDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @ApiPropertyOptional({ example: 'uuid-asset-id' })
  @IsOptional()
  @IsString()
  avatarAssetId?: string;

  @ApiPropertyOptional({ example: '1995-01-15' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  nativeLanguageId?: number;

  @ApiPropertyOptional({ example: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;
}

export class UserSettingsDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarAssetId?: string;

  @ApiPropertyOptional()
  dob?: Date;

  @ApiPropertyOptional()
  nativeLanguageId?: number;

  @ApiPropertyOptional()
  timezone?: string;

  @ApiProperty()
  updatedAt: Date;
}

export class PublicUserProfileDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarAssetId?: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;
}

export class AdminListUsersQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ example: 'ADMIN' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;
}

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '+84901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @ApiPropertyOptional({ example: 'uuid-asset-id' })
  @IsOptional()
  @IsString()
  avatarAssetId?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({ example: '1995-01-15' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  nativeLanguageId?: number;

  @ApiPropertyOptional({ example: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;
}

export class AdminSetUserRolesDto {
  @ApiProperty({ example: ['ADMIN', 'INSTRUCTOR'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  roles: string[];
}

export class UserProfileDto {
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

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiPropertyOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional()
  dob?: Date;

  @ApiPropertyOptional()
  nativeLanguageId?: number;

  @ApiPropertyOptional()
  timezone?: string;

  @ApiPropertyOptional()
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminUserDto {
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

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiPropertyOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional()
  dob?: Date;

  @ApiPropertyOptional()
  nativeLanguageId?: number;

  @ApiPropertyOptional()
  timezone?: string;

  @ApiPropertyOptional()
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [String] })
  roles: string[];
}

export class AdminUserListResponseDto {
  @ApiProperty({ type: [AdminUserDto] })
  items: AdminUserDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class AdminUserRolesResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [String] })
  roles: string[];
}
