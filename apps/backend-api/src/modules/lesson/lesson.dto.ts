/**
 * Lesson Module DTOs
 * Request and Response DTOs for lesson endpoints
 */

import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ValidateNested,
  IsUUID,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LessonType } from '../../domain/entities/lesson.entity';

// ============ REQUEST DTOs ============

export class LessonLocalizationDto {
  @ApiProperty({ example: 1, description: 'Language ID' })
  @IsInt()
  languageId: number;

  @ApiProperty({ example: 'Lesson 1: Greetings' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Learn how to greet people' })
  @IsOptional()
  @IsString()
  introText?: string;
}

export class CreateLessonDto {
  @ApiProperty({ enum: LessonType, example: LessonType.PRACTICE })
  @IsEnum(LessonType)
  lessonType: LessonType;

  @ApiPropertyOptional({ example: 15, description: 'Estimated minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ type: [LessonLocalizationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonLocalizationDto)
  localizations?: LessonLocalizationDto[];
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ enum: LessonType })
  @IsOptional()
  @IsEnum(LessonType)
  lessonType?: LessonType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class ReorderLessonsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of lesson IDs in new order',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  lessonIds: string[];
}

export class AddLessonLocalizationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  languageId: number;

  @ApiProperty({ example: 'Lesson 1: Greetings' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Learn how to greet people' })
  @IsOptional()
  @IsString()
  introText?: string;
}

// ============ RESPONSE DTOs ============

export class LessonLocalizationResponseDto {
  @ApiProperty()
  languageId: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  introText?: string;
}

export class LessonResponseDto {
  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  skillId: string;

  @ApiProperty({ enum: LessonType })
  lessonType: LessonType;

  @ApiProperty()
  orderIndex: number;

  @ApiPropertyOptional()
  estimatedMinutes?: number;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty({ type: [LessonLocalizationResponseDto] })
  localizations: LessonLocalizationResponseDto[];

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  introText?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LessonListResponseDto {
  @ApiProperty({ type: [LessonResponseDto] })
  data: LessonResponseDto[];

  @ApiProperty()
  total: number;
}
