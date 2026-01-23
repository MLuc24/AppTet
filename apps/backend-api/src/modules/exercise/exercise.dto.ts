/**
 * Exercise Module DTOs
 * Request and Response DTOs for exercise endpoints
 */

import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExerciseType, ExerciseItemType, SessionMode } from './exercise.types';

// ============ REQUEST DTOs ============

export class GetExercisesQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Language ID for prompts' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  languageId?: number;
}

export class StartSessionDto {
  @ApiProperty({ enum: SessionMode, example: SessionMode.LEARN })
  @IsEnum(SessionMode)
  mode: SessionMode;
}

export class SubmitAnswerDto {
  @ApiProperty({ description: 'Exercise item ID' })
  @IsUUID()
  exerciseItemId: string;

  @ApiPropertyOptional({
    description: 'Text answer for fill_blank, translation, etc.',
  })
  @IsOptional()
  @IsString()
  submittedText?: string;

  @ApiPropertyOptional({ description: 'Selected option ID for MCQ' })
  @IsOptional()
  @IsUUID()
  selectedOptionId?: string;

  @ApiPropertyOptional({ description: 'Time spent on this item in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}

export class SubmitAttemptDto {
  @ApiProperty({ type: [SubmitAnswerDto], description: 'Array of answers' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  responses: SubmitAnswerDto[];
}

// ============ RESPONSE DTOs ============

export class ExerciseOptionResponseDto {
  @ApiProperty()
  optionId: string;

  @ApiProperty()
  optionText: string;

  @ApiPropertyOptional()
  optionAssetUrl?: string;
}

export class ExerciseItemResponseDto {
  @ApiProperty()
  exerciseItemId: string;

  @ApiProperty()
  itemOrder: number;

  @ApiProperty({ enum: ExerciseItemType })
  itemType: ExerciseItemType;

  @ApiPropertyOptional({ type: [ExerciseOptionResponseDto] })
  options?: ExerciseOptionResponseDto[];
}

export class ExercisePromptResponseDto {
  @ApiProperty()
  promptText: string;

  @ApiPropertyOptional()
  promptAssetUrl?: string;
}

export class ExerciseResponseDto {
  @ApiProperty()
  exerciseId: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty({ enum: ExerciseType })
  exerciseType: ExerciseType;

  @ApiProperty()
  difficulty: number;

  @ApiProperty()
  points: number;

  @ApiPropertyOptional()
  timeLimitSeconds?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ExerciseDetailResponseDto extends ExerciseResponseDto {
  @ApiPropertyOptional({ type: ExercisePromptResponseDto })
  prompt?: ExercisePromptResponseDto;

  @ApiProperty({ type: [ExerciseItemResponseDto] })
  items: ExerciseItemResponseDto[];
}

export class ExerciseListResponseDto {
  @ApiProperty({ type: [ExerciseResponseDto] })
  data: ExerciseResponseDto[];

  @ApiProperty()
  total: number;
}

export class SubmitAnswerResponseDto {
  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  scoreAwarded: number;

  @ApiPropertyOptional({
    description: 'Correct answer (shown after submission)',
  })
  correctAnswer?: string;

  @ApiPropertyOptional()
  explanation?: string;
}

export class SessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty({ enum: SessionMode })
  mode: SessionMode;

  @ApiProperty()
  startedAt: Date;

  @ApiPropertyOptional()
  endedAt?: Date;
}

export class AttemptResponseDto {
  @ApiProperty()
  attemptId: string;

  @ApiProperty()
  attemptNumber: number;
}

export class ResponseResultDto {
  @ApiProperty()
  exerciseItemId: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  scoreAwarded: number;

  @ApiPropertyOptional()
  correctAnswer?: string;
}

export class AttemptResultDto {
  @ApiProperty()
  attemptId: string;

  @ApiProperty()
  totalScore: number;

  @ApiProperty()
  maxScore: number;

  @ApiProperty({ description: 'Percentage score (0-100)' })
  percentage: number;

  @ApiProperty({ type: [ResponseResultDto] })
  details: ResponseResultDto[];
}

export class CompleteSessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  endedAt: Date;

  @ApiProperty({ description: 'Best score from all attempts' })
  bestScore: number;

  @ApiProperty()
  totalAttempts: number;
}
