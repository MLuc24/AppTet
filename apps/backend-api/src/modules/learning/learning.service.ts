/**
 * Learning Service
 * Business logic for enrollment and progress tracking
 */

import { Injectable, Inject } from '@nestjs/common';
import { IEnrollmentRepository } from '../../domain/ports/enrollment-repository.port';
import { ILessonProgressRepository } from '../../domain/ports/lesson-progress-repository.port';
import { ICourseRepository } from '../../domain/ports/course-repository.port';
import { ICourseVersionRepository } from '../../domain/ports/course-version-repository.port';
import { ILessonRepository } from '../../domain/ports/lesson-repository.port';
import {
  EnrollmentEntity,
  EnrollmentStatus,
} from '../../domain/entities/enrollment.entity';
import { LessonProgressEntity } from '../../domain/entities/lesson-progress.entity';
import {
  CourseNotFoundError,
  EnrollmentNotFoundError,
  AlreadyEnrolledError,
  NotEnrolledError,
  LessonNotFoundError,
} from '../../domain/errors/course.errors';
import {
  ENROLLMENT_REPOSITORY,
  LESSON_PROGRESS_REPOSITORY,
  PRACTICE_SESSION_REPOSITORY,
  REVIEW_QUEUE_REPOSITORY,
  XP_LEDGER_REPOSITORY,
  STREAK_REPOSITORY,
} from './learning.types';
import {
  COURSE_REPOSITORY,
  COURSE_VERSION_REPOSITORY,
} from '../course/course.types';
import { LESSON_REPOSITORY } from '../lesson/lesson.types';
import {
  EnrollmentResponseDto,
  CompleteLessonResponseDto,
  CourseProgressResponseDto,
  LessonProgressResponseDto,
  ProgressTodayResponseDto,
  ProgressWeeklyResponseDto,
  ReviewQueueQueryDto,
  ReviewQueueResponseDto,
  ReviewSummaryResponseDto,
} from './learning.dto';
import { PracticeSessionRepository } from '../../infrastructure/database/repositories/practice-session.repository';
import { ReviewQueueRepository } from '../../infrastructure/database/repositories/review-queue.repository';
import { XpLedgerRepository } from '../../infrastructure/database/repositories/xp-ledger.repository';
import { StreakRepository } from '../../infrastructure/database/repositories/streak.repository';
import {
  getDateStringInTimeZone,
  getUtcRangeForDate,
  getWeekStartDateString,
} from '../../common/utils/timezone.util';

@Injectable()
export class LearningService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(LESSON_PROGRESS_REPOSITORY)
    private readonly lessonProgressRepository: ILessonProgressRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(COURSE_VERSION_REPOSITORY)
    private readonly courseVersionRepository: ICourseVersionRepository,
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
    @Inject(PRACTICE_SESSION_REPOSITORY)
    private readonly practiceSessionRepository: PracticeSessionRepository,
    @Inject(REVIEW_QUEUE_REPOSITORY)
    private readonly reviewQueueRepository: ReviewQueueRepository,
    @Inject(XP_LEDGER_REPOSITORY)
    private readonly xpLedgerRepository: XpLedgerRepository,
    @Inject(STREAK_REPOSITORY)
    private readonly streakRepository: StreakRepository,
  ) {}

  /**
   * Enroll a user in a course
   */
  async enrollInCourse(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentResponseDto> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    const isEnrolled = await this.enrollmentRepository.isEnrolled(
      userId,
      courseId,
    );
    if (isEnrolled) {
      throw new AlreadyEnrolledError(courseId);
    }

    const publishedVersion =
      await this.courseVersionRepository.findPublishedByCourseId(courseId);
    if (!publishedVersion) {
      throw new CourseNotFoundError(courseId);
    }

    const enrollment = await this.enrollmentRepository.create({
      userId,
      courseId,
      courseVersionId: publishedVersion.courseVersionId,
    });

    return this.mapEnrollmentToResponse(enrollment);
  }

  /**
   * Unenroll a user from a course
   */
  async unenrollFromCourse(userId: string, courseId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!enrollment) {
      throw new NotEnrolledError(courseId);
    }

    await this.enrollmentRepository.updateStatus(
      enrollment.enrollmentId,
      EnrollmentStatus.DROPPED,
    );
  }

  /**
   * Get all enrollments for a user
   */
  async getUserEnrollments(userId: string): Promise<EnrollmentResponseDto[]> {
    const enrollments = await this.enrollmentRepository.findByUserId(userId);
    return enrollments.map((e) => this.mapEnrollmentToResponse(e));
  }

  /**
   * Get enrollment by user and course
   */
  async getEnrollment(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!enrollment) {
      throw new NotEnrolledError(courseId);
    }
    return this.mapEnrollmentToResponse(enrollment);
  }

  /**
   * Complete a lesson and record progress
   */
  async completeLesson(
    userId: string,
    lessonId: string,
    score: number,
  ): Promise<CompleteLessonResponseDto> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(lessonId);
    }

    const enrollments = await this.enrollmentRepository.findByUserId(userId);
    const activeEnrollment = enrollments.find(
      (e) => e.status === EnrollmentStatus.ONGOING,
    );

    if (!activeEnrollment) {
      throw new EnrollmentNotFoundError('No active enrollment found');
    }

    const existingProgress =
      await this.lessonProgressRepository.findByEnrollmentAndLesson(
        activeEnrollment.enrollmentId,
        lessonId,
      );

    const isFirstCompletion = !existingProgress;

    const progress = await this.lessonProgressRepository.upsert({
      enrollmentId: activeEnrollment.enrollmentId,
      lessonId,
      score,
    });

    return {
      success: true,
      lessonProgressId: progress.lessonProgressId,
      bestScore: progress.bestScore,
      attemptsCount: progress.attemptsCount,
      isFirstCompletion,
    };
  }

  /**
   * Get course progress for a user
   */
  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<CourseProgressResponseDto> {
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!enrollment) {
      throw new NotEnrolledError(courseId);
    }

    const lessonProgress = await this.lessonProgressRepository.findByEnrollment(
      enrollment.enrollmentId,
    );

    const totalLessons = await this.countTotalLessonsInCourse(
      enrollment.courseVersionId,
    );
    const completedLessons = lessonProgress.filter((p) =>
      p.isCompleted(),
    ).length;
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      enrollmentId: enrollment.enrollmentId,
      courseId,
      totalLessons,
      completedLessons,
      progressPercentage,
      lessonProgress: lessonProgress.map((p) =>
        this.mapLessonProgressToResponse(p),
      ),
    };
  }

  /**
   * Get lesson progress for a specific lesson
   */
  async getLessonProgress(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgressResponseDto | null> {
    const enrollments = await this.enrollmentRepository.findByUserId(userId);
    const activeEnrollment = enrollments.find(
      (e) => e.status === EnrollmentStatus.ONGOING,
    );

    if (!activeEnrollment) {
      return null;
    }

    const progress =
      await this.lessonProgressRepository.findByEnrollmentAndLesson(
        activeEnrollment.enrollmentId,
        lessonId,
      );

    return progress ? this.mapLessonProgressToResponse(progress) : null;
  }

  private mapEnrollmentToResponse(
    enrollment: EnrollmentEntity,
  ): EnrollmentResponseDto {
    const json = enrollment.toJSON();
    return {
      enrollmentId: json.enrollmentId,
      userId: json.userId,
      courseId: json.courseId,
      courseVersionId: json.courseVersionId,
      status: json.status,
      enrolledAt: json.enrolledAt,
      completedAt: json.completedAt,
      createdAt: json.createdAt,
    };
  }

  private mapLessonProgressToResponse(
    progress: LessonProgressEntity,
  ): LessonProgressResponseDto {
    const json = progress.toJSON();
    return {
      lessonProgressId: json.lessonProgressId,
      enrollmentId: json.enrollmentId,
      lessonId: json.lessonId,
      bestScore: json.bestScore,
      lastScore: json.lastScore,
      completedAt: json.completedAt,
      attemptsCount: json.attemptsCount,
    };
  }

  private async countTotalLessonsInCourse(
    courseVersionId: string,
  ): Promise<number> {
    return this.lessonRepository.countByCourseVersion(courseVersionId);
  }

  async getProgressToday(
    userId: string,
    dateString?: string,
    timeZoneHeader?: string,
  ): Promise<ProgressTodayResponseDto> {
    const timeZone = timeZoneHeader || 'UTC';
    const resolvedDate =
      dateString || getDateStringInTimeZone(new Date(), timeZone);
    const { start, end } = getUtcRangeForDate(resolvedDate, timeZone);

    const [sessions, xpEarned, lessonsCompleted, streak] = await Promise.all([
      this.practiceSessionRepository.findByUserInRange(userId, start, end),
      this.xpLedgerRepository.sumByUserInRange(userId, start, end),
      this.lessonProgressRepository.countCompletedByUserInRange(
        userId,
        start,
        end,
      ),
      this.streakRepository.findByUserId(userId),
    ]);

    const minutesLearned = this.sumMinutes(sessions);
    const targetMinutes = 20;
    const progressPercent =
      targetMinutes > 0
        ? Math.round((minutesLearned / targetMinutes) * 100)
        : 0;

    return {
      date: resolvedDate,
      minutesLearned,
      xpEarned,
      lessonsCompleted,
      streakDays: streak?.currentDays ?? 0,
      goal: {
        targetMinutes,
        progressPercent,
        achieved: minutesLearned >= targetMinutes,
      },
    };
  }

  async getProgressWeekly(
    userId: string,
    weekStart?: string,
    timeZoneHeader?: string,
  ): Promise<ProgressWeeklyResponseDto> {
    const timeZone = timeZoneHeader || 'UTC';
    const todayString = getDateStringInTimeZone(new Date(), timeZone);
    const startDateString = weekStart || getWeekStartDateString(todayString);
    const { start: weekStartUtc } = getUtcRangeForDate(
      startDateString,
      timeZone,
    );
    const weekEndUtc = new Date(weekStartUtc.getTime() + 7 * 24 * 60 * 60000);
    const weekEndString = getDateStringInTimeZone(
      new Date(weekStartUtc.getTime() + 6 * 24 * 60 * 60000),
      timeZone,
    );

    const [sessions, xpEntries, completions] = await Promise.all([
      this.practiceSessionRepository.findByUserInRange(
        userId,
        weekStartUtc,
        weekEndUtc,
      ),
      this.xpLedgerRepository.findByUserInRange(
        userId,
        weekStartUtc,
        weekEndUtc,
      ),
      this.lessonProgressRepository.findCompletedDatesByUserInRange(
        userId,
        weekStartUtc,
        weekEndUtc,
      ),
    ]);

    const minutesByDate = new Map<string, number>();
    for (const session of sessions) {
      const dateKey = getDateStringInTimeZone(session.startedAt, timeZone);
      const minutes = this.sumMinutes([session]);
      minutesByDate.set(dateKey, (minutesByDate.get(dateKey) || 0) + minutes);
    }

    const xpByDate = new Map<string, number>();
    for (const entry of xpEntries) {
      const dateKey = getDateStringInTimeZone(entry.createdAt, timeZone);
      xpByDate.set(dateKey, (xpByDate.get(dateKey) || 0) + entry.xpAmount);
    }

    const lessonsByDate = new Map<string, number>();
    for (const completedAt of completions) {
      const dateKey = getDateStringInTimeZone(completedAt, timeZone);
      lessonsByDate.set(dateKey, (lessonsByDate.get(dateKey) || 0) + 1);
    }

    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const dayDate = new Date(weekStartUtc.getTime() + i * 24 * 60 * 60000);
      const dateKey = getDateStringInTimeZone(dayDate, timeZone);
      const minutes = minutesByDate.get(dateKey) || 0;
      days.push({
        date: dateKey,
        minutes,
        xp: xpByDate.get(dateKey) || 0,
        lessonsCompleted: lessonsByDate.get(dateKey) || 0,
        goalMet: minutes >= 20,
      });
    }

    return {
      weekStart: startDateString,
      weekEnd: weekEndString,
      days,
    };
  }

  async getReviewSummary(
    userId: string,
    timeZoneHeader?: string,
  ): Promise<ReviewSummaryResponseDto> {
    const timeZone = timeZoneHeader || 'UTC';
    const todayString = getDateStringInTimeZone(new Date(), timeZone);
    const { start, end } = getUtcRangeForDate(todayString, timeZone);
    const summary = await this.reviewQueueRepository.getSummary(
      userId,
      start,
      end,
      new Date(),
    );

    return {
      dueCount: summary.dueCount,
      overdueCount: summary.overdueCount,
      dueTodayCount: summary.dueTodayCount,
      nextDueAt: summary.nextDueAt,
    };
  }

  async getReviewQueue(
    userId: string,
    query: ReviewQueueQueryDto,
  ): Promise<ReviewQueueResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const skip = (page - 1) * limit;
    const dueBefore = query.dueBefore ? new Date(query.dueBefore) : undefined;

    const { items, total } = await this.reviewQueueRepository.findQueue(
      userId,
      skip,
      limit,
      dueBefore,
    );

    return {
      items,
      total,
      page,
      limit,
    };
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
