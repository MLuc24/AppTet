/**
 * Learning Module DTOs
 * Request and Response DTOs for enrollment and progress tracking
 */

import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../domain/entities/enrollment.entity';

// ============ ENROLLMENT DTOs ============

export class EnrollCourseDto {
  // courseId comes from route param, nothing needed here
}

export class EnrollmentResponseDto {
  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  courseVersionId: string;

  @ApiProperty({ enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty()
  enrolledAt: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class EnrollmentListResponseDto {
  @ApiProperty({ type: [EnrollmentResponseDto] })
  data: EnrollmentResponseDto[];

  @ApiProperty()
  total: number;
}

// ============ PROGRESS DTOs ============

export class LessonProgressResponseDto {
  @ApiProperty()
  lessonProgressId: string;

  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  bestScore: number;

  @ApiProperty()
  lastScore: number;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  attemptsCount: number;
}

export class CompleteLessonDto {
  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;
}

export class CompleteLessonResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  lessonProgressId: string;

  @ApiProperty()
  bestScore: number;

  @ApiProperty()
  attemptsCount: number;

  @ApiProperty()
  isFirstCompletion: boolean;
}

export class CourseProgressResponseDto {
  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty({ type: [LessonProgressResponseDto] })
  lessonProgress: LessonProgressResponseDto[];
}

export class SkillMasteryResponseDto {
  @ApiProperty()
  skillId: string;

  @ApiProperty()
  masteryLevel: number;

  @ApiPropertyOptional()
  lastPracticedAt?: Date;
}
