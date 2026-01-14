/**
 * Media Module DTOs
 * Request and response DTOs for media upload/management
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum MediaCategory {
  AVATAR = 'avatars',
  LESSON_IMAGE = 'lessons/images',
  LESSON_AUDIO = 'lessons/audio',
  LESSON_VIDEO = 'lessons/videos',
  EXERCISE_IMAGE = 'exercises/images',
  EXERCISE_AUDIO = 'exercises/audio',
  SUBMISSION_SPEAKING = 'submissions/speaking',
}

export class UploadMediaDto {
  @ApiPropertyOptional({
    enum: MediaCategory,
    default: MediaCategory.AVATAR,
    description: 'Category of the media file',
  })
  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory = MediaCategory.AVATAR;

  @ApiPropertyOptional({
    description: 'Custom filename (optional, will be sanitized)',
  })
  @IsOptional()
  @IsString()
  filename?: string;
}

export class MediaUploadResponseDto {
  @ApiProperty({
    description: 'Unique asset ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  assetId: string;

  @ApiProperty({
    description: 'Internal file URL (for DB storage)',
    example: 'lms-files/avatars/1234567890-avatar.jpg',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Public URL to access the file',
    example: 'https://cdn.yourdomain.com/avatars/1234567890-avatar.jpg',
  })
  publicUrl: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 102400,
  })
  fileSize: number;

  @ApiProperty({
    description: 'SHA-256 checksum',
    example: 'a1b2c3d4e5f6...',
  })
  checksum: string;
}
