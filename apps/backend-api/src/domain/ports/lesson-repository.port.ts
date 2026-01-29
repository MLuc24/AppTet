/**
 * Lesson Repository Port (Interface)
 * Manages lesson operations within skills
 */

import {
  LessonEntity,
  LessonType,
  LessonLocalization,
} from '../entities/lesson.entity';

export interface CreateLessonData {
  skillId: string;
  lessonType: LessonType;
  orderIndex: number;
  estimatedMinutes?: number;
  isPublished?: boolean;
  localizations?: LessonLocalization[];
}

export interface UpdateLessonData {
  lessonType?: LessonType;
  orderIndex?: number;
  estimatedMinutes?: number;
  isPublished?: boolean;
}

export interface ILessonRepository {
  // Query methods
  findById(lessonId: string, languageId?: number): Promise<LessonEntity | null>;
  findBySkillId(skillId: string, languageId?: number): Promise<LessonEntity[]>;
  findByCourseVersion(
    courseVersionId: string,
    languageId?: number,
  ): Promise<LessonEntity[]>;
  countBySkillId(skillId: string): Promise<number>;
  countByCourseVersion(courseVersionId: string): Promise<number>;

  // Command methods
  create(data: CreateLessonData): Promise<LessonEntity>;
  update(lessonId: string, data: UpdateLessonData): Promise<LessonEntity>;
  delete(lessonId: string): Promise<void>;

  // Bulk operations
  reorder(lessonIds: string[]): Promise<void>;

  // Localization methods
  addLocalization(
    lessonId: string,
    localization: LessonLocalization,
  ): Promise<void>;
  updateLocalization(
    lessonId: string,
    localization: LessonLocalization,
  ): Promise<void>;
  deleteLocalization(lessonId: string, languageId: number): Promise<void>;

  // Helper methods
  getNextOrderIndex(skillId: string): Promise<number>;
}
