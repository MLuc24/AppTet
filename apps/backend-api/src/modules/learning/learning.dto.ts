/**
 * Learning Module DTOs
 * Request and Response DTOs for enrollment and progress tracking
 */

import { IsInt, Min, Max, IsOptional, IsDateString } from 'class-validator';
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

// ============ PROGRESS QUERY DTOs ============

export class ProgressTodayQueryDto {
  @ApiPropertyOptional({ example: '2026-01-20' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class ProgressWeeklyQueryDto {
  @ApiPropertyOptional({ example: '2026-01-19' })
  @IsOptional()
  @IsDateString()
  weekStart?: string;
}

export class ReviewQueueQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: '2026-01-20T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueBefore?: string;
}

// ============ PROGRESS RESPONSE DTOs ============

export class ProgressGoalDto {
  @ApiProperty()
  targetMinutes: number;

  @ApiProperty()
  progressPercent: number;

  @ApiProperty()
  achieved: boolean;
}

export class ProgressTodayResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  minutesLearned: number;

  @ApiProperty()
  xpEarned: number;

  @ApiProperty()
  lessonsCompleted: number;

  @ApiProperty()
  streakDays: number;

  @ApiProperty({ type: ProgressGoalDto })
  goal: ProgressGoalDto;
}

export class ProgressWeeklyDayDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  minutes: number;

  @ApiProperty()
  xp: number;

  @ApiProperty()
  lessonsCompleted: number;

  @ApiProperty()
  goalMet: boolean;
}

export class ProgressWeeklyResponseDto {
  @ApiProperty()
  weekStart: string;

  @ApiProperty()
  weekEnd: string;

  @ApiProperty({ type: [ProgressWeeklyDayDto] })
  days: ProgressWeeklyDayDto[];
}

// ============ REVIEW RESPONSE DTOs ============

export class ReviewSummaryResponseDto {
  @ApiProperty()
  dueCount: number;

  @ApiProperty()
  overdueCount: number;

  @ApiProperty()
  dueTodayCount: number;

  @ApiPropertyOptional()
  nextDueAt?: Date;
}

export class ReviewQueueItemDto {
  @ApiProperty()
  reviewQueueId: string;

  @ApiProperty()
  itemId: string;

  @ApiProperty()
  dueAt: Date;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  source: string;
}

export class ReviewQueueResponseDto {
  @ApiProperty({ type: [ReviewQueueItemDto] })
  items: ReviewQueueItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
