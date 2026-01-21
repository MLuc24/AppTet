/**
 * Course Repository Port (Interface)
 * Domain layer defines what it needs, infrastructure implements it
 */

import { CourseEntity, CourseLocalization } from '../entities/course.entity';

export interface CreateCourseData {
  targetLanguageId: number;
  baseLanguageId: number;
  levelId: number;
  courseCode: string;
  isPublished?: boolean;
  coverAssetId?: string;
  createdBy?: string;
  localizations?: CourseLocalization[];
}

export interface UpdateCourseData {
  targetLanguageId?: number;
  baseLanguageId?: number;
  levelId?: number;
  courseCode?: string;
  isPublished?: boolean;
  coverAssetId?: string;
}

export interface CourseFilter {
  targetLanguageId?: number;
  baseLanguageId?: number;
  levelId?: number;
  isPublished?: boolean;
  search?: string;
}

export interface CourseListParams {
  skip?: number;
  take?: number;
  filter?: CourseFilter;
  languageId?: number; // For localization
}

export interface ICourseRepository {
  // Query methods
  findById(courseId: string, languageId?: number): Promise<CourseEntity | null>;
  findByCode(
    courseCode: string,
    languageId?: number,
  ): Promise<CourseEntity | null>;
  findMany(params: CourseListParams): Promise<CourseEntity[]>;
  countByFilter(filter: CourseFilter): Promise<number>;

  // Command methods
  create(data: CreateCourseData): Promise<CourseEntity>;
  update(courseId: string, data: UpdateCourseData): Promise<CourseEntity>;
  delete(courseId: string): Promise<void>;

  // Localization methods
  addLocalization(
    courseId: string,
    localization: CourseLocalization,
  ): Promise<void>;
  updateLocalization(
    courseId: string,
    localization: CourseLocalization,
  ): Promise<void>;
  deleteLocalization(courseId: string, languageId: number): Promise<void>;

  // Helper methods
  existsByCode(courseCode: string): Promise<boolean>;
}
