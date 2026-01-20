/**
 * LessonProgress Repository Implementation
 * Prisma-based implementation for lesson progress data access
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ILessonProgressRepository } from '../../../domain/ports/lesson-progress-repository.port';
import {
  LessonProgressEntity,
  LessonProgressProps,
} from '../../../domain/entities/lesson-progress.entity';

@Injectable()
export class LessonProgressRepository implements ILessonProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): LessonProgressEntity {
    const props: LessonProgressProps = {
      lessonProgressId: raw.lesson_progress_id,
      enrollmentId: raw.enrollment_id,
      lessonId: raw.lesson_id,
      bestScore: raw.best_score ?? 0,
      lastScore: raw.last_score ?? 0,
      completedAt: raw.completed_at ?? undefined,
      attemptsCount: raw.attempts_count ?? 0,
      createdAt: raw.updated_at ?? new Date(), // No created_at in schema, use updated_at
      updatedAt: raw.updated_at ?? new Date(),
    };
    return new LessonProgressEntity(props);
  }

  async findByEnrollmentAndLesson(
    enrollmentId: string,
    lessonId: string,
  ): Promise<LessonProgressEntity | null> {
    const raw = await this.prisma.lesson_progress.findUnique({
      where: {
        enrollment_id_lesson_id: {
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
        },
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByEnrollment(
    enrollmentId: string,
  ): Promise<LessonProgressEntity[]> {
    const raws = await this.prisma.lesson_progress.findMany({
      where: { enrollment_id: enrollmentId },
      orderBy: { updated_at: 'asc' },
    });
    return raws.map((raw) => this.toDomain(raw));
  }

  async upsert(data: {
    enrollmentId: string;
    lessonId: string;
    score: number;
  }): Promise<LessonProgressEntity> {
    const existing = await this.prisma.lesson_progress.findUnique({
      where: {
        enrollment_id_lesson_id: {
          enrollment_id: data.enrollmentId,
          lesson_id: data.lessonId,
        },
      },
    });

    const now = new Date();

    if (existing) {
      const existingBestScore = existing.best_score ?? 0;
      const existingAttemptsCount = existing.attempts_count ?? 0;
      const raw = await this.prisma.lesson_progress.update({
        where: {
          enrollment_id_lesson_id: {
            enrollment_id: data.enrollmentId,
            lesson_id: data.lessonId,
          },
        },
        data: {
          last_score: data.score,
          best_score:
            data.score > existingBestScore ? data.score : existingBestScore,
          attempts_count: existingAttemptsCount + 1,
          completed_at: existing.completed_at ?? now,
          updated_at: now,
        },
      });
      return this.toDomain(raw);
    }

    const raw = await this.prisma.lesson_progress.create({
      data: {
        enrollment_id: data.enrollmentId,
        lesson_id: data.lessonId,
        best_score: data.score,
        last_score: data.score,
        attempts_count: 1,
        completed_at: now,
        updated_at: now,
      },
    });
    return this.toDomain(raw);
  }

  async countCompletedByEnrollment(enrollmentId: string): Promise<number> {
    return this.prisma.lesson_progress.count({
      where: {
        enrollment_id: enrollmentId,
        completed_at: { not: null },
      },
    });
  }
}
