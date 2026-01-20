/**
 * Course Version Repository Implementation with Prisma
 * Infrastructure layer - implements ICourseVersionRepository port
 */

import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  course_versions as PrismaCourseVersion,
} from '@prisma/client';
import {
  ICourseVersionRepository,
  CreateCourseVersionData,
  UpdateCourseVersionData,
} from '../../../domain/ports/course-version-repository.port';
import {
  CourseVersionEntity,
  CourseVersionStatus,
} from '../../../domain/entities/course-version.entity';

@Injectable()
export class CourseVersionRepository implements ICourseVersionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(courseVersionId: string): Promise<CourseVersionEntity | null> {
    const version = await this.prisma.course_versions.findUnique({
      where: { course_version_id: courseVersionId },
    });
    return version ? this.toDomain(version) : null;
  }

  async findByCourseId(courseId: string): Promise<CourseVersionEntity[]> {
    const versions = await this.prisma.course_versions.findMany({
      where: { course_id: courseId },
      orderBy: { version_number: 'desc' },
    });
    return versions.map((v) => this.toDomain(v));
  }

  async findLatestByCourseId(
    courseId: string,
  ): Promise<CourseVersionEntity | null> {
    const version = await this.prisma.course_versions.findFirst({
      where: { course_id: courseId },
      orderBy: { version_number: 'desc' },
    });
    return version ? this.toDomain(version) : null;
  }

  async findPublishedByCourseId(
    courseId: string,
  ): Promise<CourseVersionEntity | null> {
    const version = await this.prisma.course_versions.findFirst({
      where: { course_id: courseId, status: CourseVersionStatus.PUBLISHED },
      orderBy: { version_number: 'desc' },
    });
    return version ? this.toDomain(version) : null;
  }

  async findDraftByCourseId(
    courseId: string,
  ): Promise<CourseVersionEntity | null> {
    const version = await this.prisma.course_versions.findFirst({
      where: { course_id: courseId, status: CourseVersionStatus.DRAFT },
    });
    return version ? this.toDomain(version) : null;
  }

  async create(data: CreateCourseVersionData): Promise<CourseVersionEntity> {
    const version = await this.prisma.course_versions.create({
      data: {
        course_id: data.courseId,
        version_number: data.versionNumber,
        status: data.status || CourseVersionStatus.DRAFT,
        created_by: data.createdBy,
      },
    });
    return this.toDomain(version);
  }

  async update(
    courseVersionId: string,
    data: UpdateCourseVersionData,
  ): Promise<CourseVersionEntity> {
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.publishedAt !== undefined)
      updateData.published_at = data.publishedAt;

    const version = await this.prisma.course_versions.update({
      where: { course_version_id: courseVersionId },
      data: updateData,
    });
    return this.toDomain(version);
  }

  async delete(courseVersionId: string): Promise<void> {
    await this.prisma.course_versions.delete({
      where: { course_version_id: courseVersionId },
    });
  }

  async getNextVersionNumber(courseId: string): Promise<number> {
    const latest = await this.prisma.course_versions.findFirst({
      where: { course_id: courseId },
      orderBy: { version_number: 'desc' },
      select: { version_number: true },
    });
    return (latest?.version_number || 0) + 1;
  }

  private toDomain(prisma: PrismaCourseVersion): CourseVersionEntity {
    return new CourseVersionEntity({
      courseVersionId: prisma.course_version_id,
      courseId: prisma.course_id,
      versionNumber: prisma.version_number,
      status: prisma.status as CourseVersionStatus,
      publishedAt: prisma.published_at ?? undefined,
      createdBy: prisma.created_by ?? undefined,
      createdAt: prisma.created_at ?? new Date(),
      updatedAt: prisma.updated_at ?? new Date(),
    });
  }
}
