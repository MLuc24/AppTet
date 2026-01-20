/**
 * Course Repository Implementation with Prisma
 * Infrastructure layer - implements ICourseRepository port
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, courses as PrismaCourse } from '@prisma/client';
import {
  ICourseRepository,
  CreateCourseData,
  UpdateCourseData,
  CourseFilter,
  CourseListParams,
} from '../../../domain/ports/course-repository.port';
import {
  CourseEntity,
  CourseLocalization,
} from '../../../domain/entities/course.entity';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(
    courseId: string,
    languageId?: number,
  ): Promise<CourseEntity | null> {
    const course = await this.prisma.courses.findUnique({
      where: { course_id: courseId },
      include: { course_localizations: true },
    });
    return course ? this.toDomain(course, languageId) : null;
  }

  async findByCode(
    courseCode: string,
    languageId?: number,
  ): Promise<CourseEntity | null> {
    const course = await this.prisma.courses.findUnique({
      where: { course_code: courseCode },
      include: { course_localizations: true },
    });
    return course ? this.toDomain(course, languageId) : null;
  }

  async findMany(params: CourseListParams): Promise<CourseEntity[]> {
    const where = this.buildFilter(params.filter);
    const courses = await this.prisma.courses.findMany({
      where,
      skip: params.skip,
      take: params.take,
      include: { course_localizations: true },
      orderBy: { created_at: 'desc' },
    });
    return courses.map((c) => this.toDomain(c, params.languageId));
  }

  async countByFilter(filter: CourseFilter): Promise<number> {
    const where = this.buildFilter(filter);
    return this.prisma.courses.count({ where });
  }

  async create(data: CreateCourseData): Promise<CourseEntity> {
    const course = await this.prisma.courses.create({
      data: {
        target_language_id: data.targetLanguageId,
        base_language_id: data.baseLanguageId,
        level_id: data.levelId,
        course_code: data.courseCode,
        is_published: data.isPublished ?? false,
        created_by: data.createdBy,
        course_localizations: data.localizations?.length
          ? {
              create: data.localizations.map((l) => ({
                language_id: l.languageId,
                title: l.title,
                description: l.description,
              })),
            }
          : undefined,
      },
      include: { course_localizations: true },
    });
    return this.toDomain(course);
  }

  async update(
    courseId: string,
    data: UpdateCourseData,
  ): Promise<CourseEntity> {
    const updateData: Record<string, unknown> = {};
    if (data.targetLanguageId !== undefined) {
      updateData.target_language_id = data.targetLanguageId;
    }
    if (data.baseLanguageId !== undefined) {
      updateData.base_language_id = data.baseLanguageId;
    }
    if (data.levelId !== undefined) updateData.level_id = data.levelId;
    if (data.courseCode !== undefined) updateData.course_code = data.courseCode;
    if (data.isPublished !== undefined)
      updateData.is_published = data.isPublished;

    const course = await this.prisma.courses.update({
      where: { course_id: courseId },
      data: updateData,
      include: { course_localizations: true },
    });
    return this.toDomain(course);
  }

  async delete(courseId: string): Promise<void> {
    await this.prisma.courses.delete({ where: { course_id: courseId } });
  }

  async addLocalization(
    courseId: string,
    localization: CourseLocalization,
  ): Promise<void> {
    await this.prisma.course_localizations.create({
      data: {
        course_id: courseId,
        language_id: localization.languageId,
        title: localization.title,
        description: localization.description,
      },
    });
  }

  async updateLocalization(
    courseId: string,
    localization: CourseLocalization,
  ): Promise<void> {
    await this.prisma.course_localizations.update({
      where: {
        course_id_language_id: {
          course_id: courseId,
          language_id: localization.languageId,
        },
      },
      data: {
        title: localization.title,
        description: localization.description,
      },
    });
  }

  async deleteLocalization(
    courseId: string,
    languageId: number,
  ): Promise<void> {
    await this.prisma.course_localizations.delete({
      where: {
        course_id_language_id: { course_id: courseId, language_id: languageId },
      },
    });
  }

  async existsByCode(courseCode: string): Promise<boolean> {
    const count = await this.prisma.courses.count({
      where: { course_code: courseCode },
    });
    return count > 0;
  }

  // Build Prisma where clause from filter
  private buildFilter(filter?: CourseFilter) {
    if (!filter) return {};
    const where: Record<string, unknown> = {};
    if (filter.targetLanguageId)
      where.target_language_id = filter.targetLanguageId;
    if (filter.baseLanguageId) where.base_language_id = filter.baseLanguageId;
    if (filter.levelId) where.level_id = filter.levelId;
    if (filter.isPublished !== undefined)
      where.is_published = filter.isPublished;
    if (filter.search) {
      where.course_localizations = {
        some: { title: { contains: filter.search, mode: 'insensitive' } },
      };
    }
    return where;
  }

  // Map Prisma model to Domain entity
  private toDomain(
    prisma: PrismaCourse & {
      course_localizations?: Array<{
        language_id: number;
        title: string;
        description: string | null;
      }>;
    },
    _languageId?: number,
  ): CourseEntity {
    const localizations: CourseLocalization[] =
      prisma.course_localizations?.map((l) => ({
        languageId: l.language_id,
        title: l.title,
        description: l.description ?? undefined,
      })) || [];

    return new CourseEntity({
      courseId: prisma.course_id,
      targetLanguageId: prisma.target_language_id,
      baseLanguageId: prisma.base_language_id,
      levelId: prisma.level_id,
      courseCode: prisma.course_code,
      isPublished: prisma.is_published ?? false,
      createdBy: prisma.created_by ?? undefined,
      createdAt: prisma.created_at ?? new Date(),
      updatedAt: prisma.updated_at ?? new Date(),
      localizations,
    });
  }
}
