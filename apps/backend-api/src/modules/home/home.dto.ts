import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HomeUserDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl?: string;
}

export class ContinueLearningDto {
  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  courseTitle: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  lessonOrder: number;

  @ApiProperty()
  lessonTitle: string;

  @ApiPropertyOptional()
  lessonEstimatedMinutes?: number;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  progressPercent: number;

  @ApiProperty()
  remainingMinutes: number;
}

export class DailyGoalDto {
  @ApiProperty()
  targetMinutes: number;

  @ApiProperty()
  learnedMinutes: number;

  @ApiProperty()
  progressPercent: number;
}

export class StreakSummaryDto {
  @ApiProperty()
  currentDays: number;

  @ApiProperty()
  longestDays: number;

  @ApiProperty()
  freezeCount: number;
}

export class ReviewSummaryDto {
  @ApiProperty()
  dueCount: number;
}

export class NotificationSummaryDto {
  @ApiProperty()
  unreadCount: number;
}

export class HomeSummaryResponseDto {
  @ApiProperty({ type: HomeUserDto })
  user: HomeUserDto;

  @ApiPropertyOptional({ type: ContinueLearningDto, nullable: true })
  continueLearning: ContinueLearningDto | null;

  @ApiProperty({ type: DailyGoalDto })
  dailyGoal: DailyGoalDto;

  @ApiProperty({ type: StreakSummaryDto })
  streak: StreakSummaryDto;

  @ApiProperty({ type: ReviewSummaryDto })
  review: ReviewSummaryDto;

  @ApiProperty({ type: NotificationSummaryDto })
  notifications: NotificationSummaryDto;
}

export class HomeContinueResponseDto {
  @ApiPropertyOptional({ type: ContinueLearningDto, nullable: true })
  continueLearning: ContinueLearningDto | null;
}
