/**
 * LessonProgress Repository Port
 * Defines interface for lesson progress data access
 */

import { LessonProgressEntity } from '../entities/lesson-progress.entity';

export interface ILessonProgressRepository {
  /**
   * Find progress by enrollment and lesson
   */
  findByEnrollmentAndLesson(
    enrollmentId: string,
    lessonId: string,
  ): Promise<LessonProgressEntity | null>;

  /**
   * Find all progress for an enrollment
   */
  findByEnrollment(enrollmentId: string): Promise<LessonProgressEntity[]>;

  /**
   * Create or update lesson progress
   */
  upsert(data: {
    enrollmentId: string;
    lessonId: string;
    score: number;
  }): Promise<LessonProgressEntity>;

  /**
   * Count completed lessons for an enrollment
   */
  countCompletedByEnrollment(enrollmentId: string): Promise<number>;
}
