/**
 * Course Module DTOs
 * Request and Response DTOs for course endpoints
 */

import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ============ REQUEST DTOs ============

export class LocalizationDto {
  @ApiProperty({ example: 1, description: 'Language ID' })
  @IsInt()
  languageId: number;

  @ApiProperty({ example: 'English for Beginners' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'A comprehensive course for beginners' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCourseDto {
  @ApiProperty({
    example: 1,
    description: 'Target language ID (e.g., English)',
  })
  @IsInt()
  targetLanguageId: number;

  @ApiProperty({
    example: 2,
    description: 'Base language ID (e.g., Vietnamese)',
  })
  @IsInt()
  baseLanguageId: number;

  @ApiProperty({ example: 1, description: 'Proficiency level ID (e.g., A1)' })
  @IsInt()
  levelId: number;

  @ApiPropertyOptional({
    example: 'EN-A1-001',
    description: 'Unique course code (auto-generated if not provided)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  courseCode?: string;

  @ApiPropertyOptional({ description: 'Cover image file (multipart/form-data)' })
  coverImage?: any; // Will be handled by multer

  @ApiPropertyOptional({ type: [LocalizationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalizationDto)
  localizations?: LocalizationDto[];
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  targetLanguageId?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  baseLanguageId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  levelId?: number;

  @ApiPropertyOptional({ example: 'EN-A1-002' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  courseCode?: string;

  @ApiPropertyOptional({ description: 'Cover image asset ID' })
  @IsOptional()
  @IsString()
  coverAssetId?: string;
}

export class CourseQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  targetLanguageId?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  baseLanguageId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  levelId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Language ID for localization',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  languageId?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}

export class AddLocalizationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  languageId: number;

  @ApiProperty({ example: 'English for Beginners' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'A comprehensive course for beginners' })
  @IsOptional()
  @IsString()
  description?: string;
}

// ============ RESPONSE DTOs ============

export class CourseLocalizationResponseDto {
  @ApiProperty()
  languageId: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;
}

export class CourseResponseDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  courseCode: string;

  @ApiProperty()
  targetLanguageId: number;

  @ApiProperty()
  baseLanguageId: number;

  @ApiProperty()
  levelId: number;

  @ApiProperty()
  isPublished: boolean;

  @ApiPropertyOptional()
  coverAssetId?: string;

  @ApiPropertyOptional()
  coverUrl?: string;

  @ApiPropertyOptional()
  currentVersionId?: string;

  @ApiProperty({ type: [CourseLocalizationResponseDto] })
  localizations: CourseLocalizationResponseDto[];

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CourseListResponseDto {
  @ApiProperty({ type: [CourseResponseDto] })
  data: CourseResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class PublishCourseResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  publishedAt: Date;
}
