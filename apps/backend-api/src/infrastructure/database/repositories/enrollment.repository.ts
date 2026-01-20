/**
 * Enrollment Repository Implementation with Prisma
 * Infrastructure layer - implements IEnrollmentRepository port
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, enrollments as PrismaEnrollment } from '@prisma/client';
import {
  IEnrollmentRepository,
  CreateEnrollmentData,
  UpdateEnrollmentData,
  EnrollmentFilter,
} from '../../../domain/ports/enrollment-repository.port';
import {
  EnrollmentEntity,
  EnrollmentStatus,
} from '../../../domain/entities/enrollment.entity';

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(enrollmentId: string): Promise<EnrollmentEntity | null> {
    const enrollment = await this.prisma.enrollments.findUnique({
      where: { enrollment_id: enrollmentId },
    });
    return enrollment ? this.toDomain(enrollment) : null;
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentEntity | null> {
    const enrollment = await this.prisma.enrollments.findFirst({
      where: { user_id: userId, course_id: courseId },
    });
    return enrollment ? this.toDomain(enrollment) : null;
  }

  async findByUserId(
    userId: string,
    status?: EnrollmentStatus,
  ): Promise<EnrollmentEntity[]> {
    const where: Record<string, unknown> = { user_id: userId };
    if (status) where.status = status;

    const enrollments = await this.prisma.enrollments.findMany({
      where,
      orderBy: { enrolled_at: 'desc' },
    });
    return enrollments.map((e) => this.toDomain(e));
  }

  async findByCourseId(
    courseId: string,
    status?: EnrollmentStatus,
  ): Promise<EnrollmentEntity[]> {
    const where: Record<string, unknown> = { course_id: courseId };
    if (status) where.status = status;

    const enrollments = await this.prisma.enrollments.findMany({
      where,
      orderBy: { enrolled_at: 'desc' },
    });
    return enrollments.map((e) => this.toDomain(e));
  }

  async countByFilter(filter: EnrollmentFilter): Promise<number> {
    const where: Record<string, unknown> = {};
    if (filter.userId) where.user_id = filter.userId;
    if (filter.courseId) where.course_id = filter.courseId;
    if (filter.status) where.status = filter.status;

    return this.prisma.enrollments.count({ where });
  }

  async create(data: CreateEnrollmentData): Promise<EnrollmentEntity> {
    const enrollment = await this.prisma.enrollments.create({
      data: {
        user_id: data.userId,
        course_id: data.courseId,
        course_version_id: data.courseVersionId,
        status: EnrollmentStatus.ONGOING,
        enrolled_at: new Date(),
      },
    });
    return this.toDomain(enrollment);
  }

  async update(
    enrollmentId: string,
    data: UpdateEnrollmentData,
  ): Promise<EnrollmentEntity> {
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.completedAt !== undefined)
      updateData.completed_at = data.completedAt;

    const enrollment = await this.prisma.enrollments.update({
      where: { enrollment_id: enrollmentId },
      data: updateData,
    });
    return this.toDomain(enrollment);
  }

  async delete(enrollmentId: string): Promise<void> {
    await this.prisma.enrollments.delete({
      where: { enrollment_id: enrollmentId },
    });
  }

  async updateStatus(
    enrollmentId: string,
    status: EnrollmentStatus,
  ): Promise<void> {
    await this.prisma.enrollments.update({
      where: { enrollment_id: enrollmentId },
      data: { status, updated_at: new Date() },
    });
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const count = await this.prisma.enrollments.count({
      where: {
        user_id: userId,
        course_id: courseId,
        status: EnrollmentStatus.ONGOING,
      },
    });
    return count > 0;
  }

  private toDomain(prisma: PrismaEnrollment): EnrollmentEntity {
    return new EnrollmentEntity({
      enrollmentId: prisma.enrollment_id,
      userId: prisma.user_id,
      courseId: prisma.course_id,
      courseVersionId: prisma.course_version_id,
      status: prisma.status as EnrollmentStatus,
      enrolledAt: prisma.enrolled_at ?? new Date(),
      completedAt: undefined, // Not in schema, derived from status
      createdAt: prisma.created_at ?? new Date(),
      updatedAt: prisma.updated_at ?? new Date(),
    });
  }
}
