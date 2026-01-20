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
} from './learning.dto';

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
    // This would ideally be a dedicated query, but for now we return 0
    // A more efficient approach would add a method to the repository
    return 0;
  }
}
