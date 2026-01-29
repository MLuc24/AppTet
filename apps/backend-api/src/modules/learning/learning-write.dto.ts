/**
 * Learning Write DTOs
 * Request and Response DTOs for write operations
 */

import { IsUUID, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============ PRACTICE SESSION DTOs ============

export enum SessionMode {
  LEARN = 'learn',
  REVIEW = 'review',
  TEST = 'test',
}

export class StartPracticeSessionDto {
  @ApiProperty({ enum: SessionMode, example: SessionMode.LEARN })
  @IsEnum(SessionMode)
  mode: SessionMode;
}

export class StartPracticeSessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty({ enum: SessionMode })
  mode: SessionMode;

  @ApiProperty()
  startedAt: Date;
}

export class EndPracticeSessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  endedAt: Date;

  @ApiProperty()
  durationMinutes: number;
}

// ============ REVIEW SUBMISSION DTOs ============

export class SubmitReviewDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({ example: 'Xin chào' })
  @IsOptional()
  userAnswer?: string;
}

export class SubmitReviewResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  itemId: string;

  @ApiProperty()
  nextReviewAt: Date;

  @ApiProperty()
  newStage: number;

  @ApiProperty()
  intervalDays: number;
}
