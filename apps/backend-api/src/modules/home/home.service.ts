import { Injectable, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ENROLLMENT_REPOSITORY, LESSON_PROGRESS_REPOSITORY, PRACTICE_SESSION_REPOSITORY, REVIEW_QUEUE_REPOSITORY } from '../learning/learning.types';
import { COURSE_REPOSITORY } from '../course/course.types';
import { LESSON_REPOSITORY } from '../lesson/lesson.types';
import { IEnrollmentRepository } from '../../domain/ports/enrollment-repository.port';
import { ILessonProgressRepository } from '../../domain/ports/lesson-progress-repository.port';
import { ICourseRepository } from '../../domain/ports/course-repository.port';
import { ILessonRepository } from '../../domain/ports/lesson-repository.port';
import { EnrollmentStatus } from '../../domain/entities/enrollment.entity';
import { PracticeSessionRepository } from '../../infrastructure/database/repositories/practice-session.repository';
import { ReviewQueueRepository } from '../../infrastructure/database/repositories/review-queue.repository';
import { StreakRepository } from '../../infrastructure/database/repositories/streak.repository';
import { NotificationRepository } from '../../infrastructure/database/repositories/notification.repository';
import {
  ContinueLearningDto,
  DailyGoalDto,
  HomeContinueResponseDto,
  HomeSummaryResponseDto,
  NotificationSummaryDto,
  ReviewSummaryDto,
  StreakSummaryDto,
} from './home.dto';
import { getDateStringInTimeZone, getUtcRangeForDate } from '../../common/utils/timezone.util';

const DEFAULT_DAILY_GOAL_MINUTES = 20;

@Injectable()
export class HomeService {
  constructor(
    private readonly userService: UserService,
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(LESSON_PROGRESS_REPOSITORY)
    private readonly lessonProgressRepository: ILessonProgressRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
    @Inject(PRACTICE_SESSION_REPOSITORY)
    private readonly practiceSessionRepository: PracticeSessionRepository,
    @Inject(REVIEW_QUEUE_REPOSITORY)
    private readonly reviewQueueRepository: ReviewQueueRepository,
    private readonly streakRepository: StreakRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getSummary(userId: string): Promise<HomeSummaryResponseDto> {
    const userProfile = await this.userService.getProfile(userId);
    const timeZone = userProfile.timezone || 'UTC';
    const todayString = getDateStringInTimeZone(new Date(), timeZone);
    const { start: dayStart, end: dayEnd } = getUtcRangeForDate(
      todayString,
      timeZone,
    );

    const [
      continueLearning,
      dailyGoal,
      streak,
      review,
      notifications,
    ] = await Promise.all([
      this.getContinueLearning(userId),
      this.getDailyGoal(userId, dayStart, dayEnd),
      this.getStreakSummary(userId),
      this.getReviewSummary(userId, dayStart, dayEnd),
      this.getNotificationSummary(userId),
    ]);

    return {
      user: {
        userId: userProfile.userId,
        displayName: userProfile.displayName,
        avatarUrl: userProfile.avatarUrl,
      },
      continueLearning,
      dailyGoal,
      streak,
      review,
      notifications,
    };
  }

  async getContinue(userId: string): Promise<HomeContinueResponseDto> {
    const continueLearning = await this.getContinueLearning(userId);
    return { continueLearning };
  }

  async getContinueLearning(userId: string): Promise<ContinueLearningDto | null> {
    const enrollments = await this.enrollmentRepository.findByUserId(userId);
    const activeEnrollment = enrollments.find(
      (enrollment) => enrollment.status === EnrollmentStatus.ONGOING,
    );

    if (!activeEnrollment) {
      return null;
    }

    const [course, lessonProgress, lessons] = await Promise.all([
      this.courseRepository.findById(activeEnrollment.courseId),
      this.lessonProgressRepository.findByEnrollment(
        activeEnrollment.enrollmentId,
      ),
      this.lessonRepository.findByCourseVersion(
        activeEnrollment.courseVersionId,
      ),
    ]);

    if (!course || lessons.length === 0) {
      return null;
    }

    const completedLessonIds = new Set(
      lessonProgress.filter((p) => p.isCompleted()).map((p) => p.lessonId),
    );
    const completedLessons = lessonProgress.filter((p) => p.isCompleted()).length;
    const totalLessons = lessons.length;
    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    const nextLesson =
      lessons.find((lesson) => !completedLessonIds.has(lesson.lessonId)) ||
      lessons[lessons.length - 1];

    const remainingMinutes = lessons
      .filter((lesson) => !completedLessonIds.has(lesson.lessonId))
      .reduce((sum, lesson) => sum + (lesson.estimatedMinutes ?? 0), 0);

    return {
      enrollmentId: activeEnrollment.enrollmentId,
      courseId: activeEnrollment.courseId,
      courseTitle:
        course.localizations[0]?.title || course.courseCode || 'Course',
      lessonId: nextLesson.lessonId,
      lessonOrder: nextLesson.orderIndex,
      lessonTitle: nextLesson.localizations[0]?.title || 'Lesson',
      lessonEstimatedMinutes: nextLesson.estimatedMinutes,
      completedLessons,
      totalLessons,
      progressPercent,
      remainingMinutes,
    };
  }

  private async getDailyGoal(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<DailyGoalDto> {
    const sessions = await this.practiceSessionRepository.findByUserInRange(
      userId,
      start,
      end,
    );

    const learnedMinutes = this.sumMinutes(sessions);
    const progressPercent =
      DEFAULT_DAILY_GOAL_MINUTES > 0
        ? Math.round((learnedMinutes / DEFAULT_DAILY_GOAL_MINUTES) * 100)
        : 0;

    return {
      targetMinutes: DEFAULT_DAILY_GOAL_MINUTES,
      learnedMinutes,
      progressPercent,
    };
  }

  private async getStreakSummary(userId: string): Promise<StreakSummaryDto> {
    const streak = await this.streakRepository.findByUserId(userId);
    return {
      currentDays: streak?.currentDays ?? 0,
      longestDays: streak?.longestDays ?? 0,
      freezeCount: streak?.freezeCount ?? 0,
    };
  }

  private async getReviewSummary(
    userId: string,
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<ReviewSummaryDto> {
    const summary = await this.reviewQueueRepository.getSummary(
      userId,
      startOfDay,
      endOfDay,
      new Date(),
    );
    return {
      dueCount: summary.dueCount,
    };
  }

  private async getNotificationSummary(
    userId: string,
  ): Promise<NotificationSummaryDto> {
    const unreadCount =
      await this.notificationRepository.countUnreadByUserId(userId);
    return { unreadCount };
  }

  private sumMinutes(
    sessions: Array<{ startedAt: Date; endedAt?: Date }>,
  ): number {
    const totalSeconds = sessions.reduce((sum, session) => {
      if (!session.endedAt) return sum;
      const delta = session.endedAt.getTime() - session.startedAt.getTime();
      if (delta <= 0) return sum;
      return sum + delta / 1000;
    }, 0);

    return Math.round(totalSeconds / 60);
  }
}
