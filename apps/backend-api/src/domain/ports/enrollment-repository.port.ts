/**
 * Enrollment Repository Port (Interface)
 * Manages user course enrollment operations
 */

import {
  EnrollmentEntity,
  EnrollmentStatus,
} from '../entities/enrollment.entity';

export interface CreateEnrollmentData {
  userId: string;
  courseId: string;
  courseVersionId: string;
}

export interface UpdateEnrollmentData {
  status?: EnrollmentStatus;
  completedAt?: Date;
}

export interface EnrollmentFilter {
  userId?: string;
  courseId?: string;
  status?: EnrollmentStatus;
}

export interface IEnrollmentRepository {
  // Query methods
  findById(enrollmentId: string): Promise<EnrollmentEntity | null>;
  findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentEntity | null>;
  findByUserId(
    userId: string,
    status?: EnrollmentStatus,
  ): Promise<EnrollmentEntity[]>;
  findByCourseId(
    courseId: string,
    status?: EnrollmentStatus,
  ): Promise<EnrollmentEntity[]>;
  countByFilter(filter: EnrollmentFilter): Promise<number>;

  // Command methods
  create(data: CreateEnrollmentData): Promise<EnrollmentEntity>;
  update(
    enrollmentId: string,
    data: UpdateEnrollmentData,
  ): Promise<EnrollmentEntity>;
  updateStatus(enrollmentId: string, status: EnrollmentStatus): Promise<void>;
  delete(enrollmentId: string): Promise<void>;

  // Helper methods
  isEnrolled(userId: string, courseId: string): Promise<boolean>;
}
