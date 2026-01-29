/**
 * Lesson Repository Implementation with Prisma
 * Infrastructure layer - implements ILessonRepository port
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, lessons as PrismaLesson } from '@prisma/client';
import {
  ILessonRepository,
  CreateLessonData,
  UpdateLessonData,
} from '../../../domain/ports/lesson-repository.port';
import {
  LessonEntity,
  LessonType,
  LessonLocalization,
} from '../../../domain/entities/lesson.entity';

@Injectable()
export class LessonRepository implements ILessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(
    lessonId: string,
    languageId?: number,
  ): Promise<LessonEntity | null> {
    const lesson = await this.prisma.lessons.findUnique({
      where: { lesson_id: lessonId },
      include: { lesson_localizations: true },
    });
    return lesson ? this.toDomain(lesson, languageId) : null;
  }

  async findBySkillId(
    skillId: string,
    languageId?: number,
  ): Promise<LessonEntity[]> {
    const lessons = await this.prisma.lessons.findMany({
      where: { skill_id: skillId },
      include: { lesson_localizations: true },
      orderBy: { order_index: 'asc' },
    });
    return lessons.map((l) => this.toDomain(l, languageId));
  }

  async findByCourseVersion(
    courseVersionId: string,
    languageId?: number,
  ): Promise<LessonEntity[]> {
    const lessons = await this.prisma.lessons.findMany({
      where: {
        skills: {
          units: {
            course_version_id: courseVersionId,
          },
        },
      },
      include: {
        lesson_localizations: true,
        skills: {
          select: {
            order_index: true,
            units: { select: { order_index: true } },
          },
        },
      },
    });

    const sorted = lessons.sort((a, b) => {
      const aUnitOrder = a.skills?.units?.order_index ?? 0;
      const bUnitOrder = b.skills?.units?.order_index ?? 0;
      if (aUnitOrder !== bUnitOrder) return aUnitOrder - bUnitOrder;
      const aSkillOrder = a.skills?.order_index ?? 0;
      const bSkillOrder = b.skills?.order_index ?? 0;
      if (aSkillOrder !== bSkillOrder) return aSkillOrder - bSkillOrder;
      return a.order_index - b.order_index;
    });

    return sorted.map((lesson) => this.toDomain(lesson, languageId));
  }

  async countBySkillId(skillId: string): Promise<number> {
    return this.prisma.lessons.count({ where: { skill_id: skillId } });
  }

  async countByCourseVersion(courseVersionId: string): Promise<number> {
    return this.prisma.lessons.count({
      where: {
        skills: {
          units: {
            course_version_id: courseVersionId,
          },
        },
      },
    });
  }

  async create(data: CreateLessonData): Promise<LessonEntity> {
    const lesson = await this.prisma.lessons.create({
      data: {
        skill_id: data.skillId,
        lesson_type: data.lessonType,
        order_index: data.orderIndex,
        estimated_minutes: data.estimatedMinutes,
        is_published: data.isPublished ?? false,
        lesson_localizations: data.localizations?.length
          ? {
              create: data.localizations.map((l) => ({
                language_id: l.languageId,
                title: l.title,
                intro_text: l.introText,
              })),
            }
          : undefined,
      },
      include: { lesson_localizations: true },
    });
    return this.toDomain(lesson);
  }

  async update(
    lessonId: string,
    data: UpdateLessonData,
  ): Promise<LessonEntity> {
    const updateData: Record<string, unknown> = {};
    if (data.lessonType !== undefined) updateData.lesson_type = data.lessonType;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
    if (data.estimatedMinutes !== undefined) {
      updateData.estimated_minutes = data.estimatedMinutes;
    }
    if (data.isPublished !== undefined)
      updateData.is_published = data.isPublished;

    const lesson = await this.prisma.lessons.update({
      where: { lesson_id: lessonId },
      data: updateData,
      include: { lesson_localizations: true },
    });
    return this.toDomain(lesson);
  }

  async delete(lessonId: string): Promise<void> {
    await this.prisma.lessons.delete({ where: { lesson_id: lessonId } });
  }

  async reorder(lessonIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      lessonIds.map((id, index) =>
        this.prisma.lessons.update({
          where: { lesson_id: id },
          data: { order_index: index },
        }),
      ),
    );
  }

  async addLocalization(
    lessonId: string,
    localization: LessonLocalization,
  ): Promise<void> {
    await this.prisma.lesson_localizations.create({
      data: {
        lesson_id: lessonId,
        language_id: localization.languageId,
        title: localization.title,
        intro_text: localization.introText,
      },
    });
  }

  async updateLocalization(
    lessonId: string,
    localization: LessonLocalization,
  ): Promise<void> {
    await this.prisma.lesson_localizations.update({
      where: {
        lesson_id_language_id: {
          lesson_id: lessonId,
          language_id: localization.languageId,
        },
      },
      data: {
        title: localization.title,
        intro_text: localization.introText,
      },
    });
  }

  async deleteLocalization(
    lessonId: string,
    languageId: number,
  ): Promise<void> {
    await this.prisma.lesson_localizations.delete({
      where: {
        lesson_id_language_id: { lesson_id: lessonId, language_id: languageId },
      },
    });
  }

  async getNextOrderIndex(skillId: string): Promise<number> {
    const max = await this.prisma.lessons.aggregate({
      where: { skill_id: skillId },
      _max: { order_index: true },
    });
    return (max._max.order_index ?? -1) + 1;
  }

  private toDomain(
    prisma: PrismaLesson & {
      lesson_localizations?: Array<{
        language_id: number;
        title: string;
        intro_text: string | null;
      }>;
    },
    _languageId?: number,
  ): LessonEntity {
    const localizations: LessonLocalization[] =
      prisma.lesson_localizations?.map((l) => ({
        languageId: l.language_id,
        title: l.title,
        introText: l.intro_text ?? undefined,
      })) || [];

    return new LessonEntity({
      lessonId: prisma.lesson_id,
      skillId: prisma.skill_id,
      lessonType: prisma.lesson_type as LessonType,
      orderIndex: prisma.order_index,
      estimatedMinutes: prisma.estimated_minutes ?? undefined,
      isPublished: prisma.is_published ?? false,
      createdAt: prisma.created_at ?? new Date(),
      updatedAt: prisma.updated_at ?? new Date(),
      localizations,
    });
  }
}
