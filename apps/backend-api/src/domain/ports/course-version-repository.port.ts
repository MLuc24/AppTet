/**
 * Course Version Repository Port (Interface)
 * Manages course version operations
 */

import {
  CourseVersionEntity,
  CourseVersionStatus,
} from '../entities/course-version.entity';

export interface CreateCourseVersionData {
  courseId: string;
  versionNumber: number;
  status?: CourseVersionStatus;
  createdBy?: string;
}

export interface UpdateCourseVersionData {
  status?: CourseVersionStatus;
  publishedAt?: Date;
}

export interface ICourseVersionRepository {
  // Query methods
  findById(courseVersionId: string): Promise<CourseVersionEntity | null>;
  findByCourseId(courseId: string): Promise<CourseVersionEntity[]>;
  findLatestByCourseId(courseId: string): Promise<CourseVersionEntity | null>;
  findPublishedByCourseId(
    courseId: string,
  ): Promise<CourseVersionEntity | null>;
  findDraftByCourseId(courseId: string): Promise<CourseVersionEntity | null>;

  // Command methods
  create(data: CreateCourseVersionData): Promise<CourseVersionEntity>;
  update(
    courseVersionId: string,
    data: UpdateCourseVersionData,
  ): Promise<CourseVersionEntity>;
  delete(courseVersionId: string): Promise<void>;

  // Helper methods
  getNextVersionNumber(courseId: string): Promise<number>;
}
