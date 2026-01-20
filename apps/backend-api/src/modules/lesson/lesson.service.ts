/**
 * Lesson Service
 * Business logic orchestration for lesson operations
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ILessonRepository } from '../../domain/ports/lesson-repository.port';
import { ISkillRepository } from '../../domain/ports/skill-repository.port';
import { LessonEntity } from '../../domain/entities/lesson.entity';
import { LESSON_REPOSITORY, LESSON_MESSAGES } from './lesson.types';
import { SKILL_REPOSITORY } from '../skill/skill.types';
import {
  CreateLessonDto,
  UpdateLessonDto,
  ReorderLessonsDto,
  AddLessonLocalizationDto,
  LessonResponseDto,
  LessonListResponseDto,
} from './lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
    @Inject(SKILL_REPOSITORY)
    private readonly skillRepository: ISkillRepository,
  ) {}

  async createLesson(
    skillId: string,
    dto: CreateLessonDto,
  ): Promise<LessonResponseDto> {
    // Verify skill exists
    const skill = await this.skillRepository.findById(skillId);
    if (!skill) {
      throw new NotFoundException(LESSON_MESSAGES.SKILL_NOT_FOUND);
    }

    const orderIndex = await this.lessonRepository.getNextOrderIndex(skillId);

    const lesson = await this.lessonRepository.create({
      skillId,
      lessonType: dto.lessonType,
      orderIndex,
      estimatedMinutes: dto.estimatedMinutes,
      localizations: dto.localizations?.map((l) => ({
        languageId: l.languageId,
        title: l.title,
        introText: l.introText,
      })),
    });

    return this.toResponseDto(lesson, dto.localizations?.[0]?.languageId);
  }

  async getLessonById(
    lessonId: string,
    languageId?: number,
  ): Promise<LessonResponseDto> {
    const lesson = await this.lessonRepository.findById(lessonId, languageId);
    if (!lesson) {
      throw new NotFoundException(LESSON_MESSAGES.NOT_FOUND);
    }
    return this.toResponseDto(lesson, languageId);
  }

  async getLessonsBySkill(
    skillId: string,
    languageId?: number,
  ): Promise<LessonListResponseDto> {
    const [lessons, total] = await Promise.all([
      this.lessonRepository.findBySkillId(skillId, languageId),
      this.lessonRepository.countBySkillId(skillId),
    ]);

    return {
      data: lessons.map((l) => this.toResponseDto(l, languageId)),
      total,
    };
  }

  async updateLesson(
    lessonId: string,
    dto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(LESSON_MESSAGES.NOT_FOUND);
    }

    const updated = await this.lessonRepository.update(lessonId, {
      lessonType: dto.lessonType,
      orderIndex: dto.orderIndex,
      estimatedMinutes: dto.estimatedMinutes,
      isPublished: dto.isPublished,
    });

    return this.toResponseDto(updated);
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(LESSON_MESSAGES.NOT_FOUND);
    }
    await this.lessonRepository.delete(lessonId);
  }

  async reorderLessons(skillId: string, dto: ReorderLessonsDto): Promise<void> {
    // Verify skill exists
    const skill = await this.skillRepository.findById(skillId);
    if (!skill) {
      throw new NotFoundException(LESSON_MESSAGES.SKILL_NOT_FOUND);
    }

    await this.lessonRepository.reorder(dto.lessonIds);
  }

  async addLocalization(
    lessonId: string,
    dto: AddLessonLocalizationDto,
  ): Promise<void> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(LESSON_MESSAGES.NOT_FOUND);
    }

    await this.lessonRepository.addLocalization(lessonId, {
      languageId: dto.languageId,
      title: dto.title,
      introText: dto.introText,
    });
  }

  async updateLocalization(
    lessonId: string,
    dto: AddLessonLocalizationDto,
  ): Promise<void> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(LESSON_MESSAGES.NOT_FOUND);
    }

    await this.lessonRepository.updateLocalization(lessonId, {
      languageId: dto.languageId,
      title: dto.title,
      introText: dto.introText,
    });
  }

  async deleteLocalization(
    lessonId: string,
    languageId: number,
  ): Promise<void> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(LESSON_MESSAGES.NOT_FOUND);
    }

    await this.lessonRepository.deleteLocalization(lessonId, languageId);
  }

  private toResponseDto(
    lesson: LessonEntity,
    languageId?: number,
  ): LessonResponseDto {
    const localization = languageId
      ? lesson.localizations.find((l) => l.languageId === languageId)
      : lesson.localizations[0];

    return {
      lessonId: lesson.lessonId,
      skillId: lesson.skillId,
      lessonType: lesson.lessonType,
      orderIndex: lesson.orderIndex,
      estimatedMinutes: lesson.estimatedMinutes,
      isPublished: lesson.isPublished,
      localizations: lesson.localizations.map((l) => ({
        languageId: l.languageId,
        title: l.title,
        introText: l.introText,
      })),
      title: localization?.title,
      introText: localization?.introText,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
