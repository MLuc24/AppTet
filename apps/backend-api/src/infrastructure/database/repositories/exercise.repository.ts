/**
 * Exercise Repository Implementation
 * Prisma-based repository for exercise operations
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  IExerciseRepository,
  CreateExerciseData,
  UpdateExerciseData,
} from '../../../domain/ports/exercise-repository.port';
import {
  ExerciseEntity,
  ExerciseItem,
  ExerciseOption,
  ExercisePrompt,
} from '../../../domain/entities/exercise.entity';
import {
  ExerciseType,
  ExerciseItemType,
  EXERCISE_DEFAULTS,
} from '../../../modules/exercise/exercise.types';

@Injectable()
export class ExerciseRepository implements IExerciseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(
    exerciseId: string,
    languageId?: number,
  ): Promise<ExerciseEntity | null> {
    const exercise = await this.prisma.exercises.findUnique({
      where: { exercise_id: exerciseId },
      include: {
        exercise_prompts: languageId
          ? { where: { language_id: languageId } }
          : true,
      },
    });

    if (!exercise) return null;
    return this.toEntity(exercise);
  }

  async findByLessonId(
    lessonId: string,
    languageId?: number,
  ): Promise<ExerciseEntity[]> {
    const exercises = await this.prisma.exercises.findMany({
      where: { lesson_id: lessonId },
      include: {
        exercise_prompts: languageId
          ? { where: { language_id: languageId } }
          : true,
      },
      orderBy: { created_at: 'asc' },
    });

    return exercises.map((e) => this.toEntity(e));
  }

  async findByIdWithItems(
    exerciseId: string,
    languageId?: number,
  ): Promise<ExerciseEntity | null> {
    const exercise = await this.prisma.exercises.findUnique({
      where: { exercise_id: exerciseId },
      include: {
        exercise_prompts: languageId
          ? {
              where: { language_id: languageId },
              include: { media_assets: true },
            }
          : { include: { media_assets: true } },
        exercise_items: {
          orderBy: { item_order: 'asc' },
          include: {
            exercise_options: {
              include: { media_assets: true },
            },
          },
        },
      },
    });

    if (!exercise) return null;
    return this.toEntityWithItems(exercise);
  }

  async countByLessonId(lessonId: string): Promise<number> {
    return this.prisma.exercises.count({
      where: { lesson_id: lessonId },
    });
  }

  async create(data: CreateExerciseData): Promise<ExerciseEntity> {
    const exercise = await this.prisma.exercises.create({
      data: {
        lesson_id: data.lessonId,
        exercise_type: data.exerciseType,
        difficulty: data.difficulty ?? EXERCISE_DEFAULTS.DEFAULT_DIFFICULTY,
        points: data.points ?? EXERCISE_DEFAULTS.POINTS_PER_CORRECT,
        time_limit_seconds: data.timeLimitSeconds,
      },
    });

    return this.toEntity(exercise);
  }

  async update(
    exerciseId: string,
    data: UpdateExerciseData,
  ): Promise<ExerciseEntity> {
    const exercise = await this.prisma.exercises.update({
      where: { exercise_id: exerciseId },
      data: {
        exercise_type: data.exerciseType,
        difficulty: data.difficulty,
        points: data.points,
        time_limit_seconds: data.timeLimitSeconds,
      },
    });

    return this.toEntity(exercise);
  }

  async delete(exerciseId: string): Promise<void> {
    await this.prisma.exercises.delete({
      where: { exercise_id: exerciseId },
    });
  }

  async getCorrectAnswer(exerciseItemId: string): Promise<{
    correctText?: string;
    correctOptionId?: string;
  } | null> {
    const item = await this.prisma.exercise_items.findUnique({
      where: { exercise_item_id: exerciseItemId },
      include: {
        exercise_options: {
          where: { is_correct: true },
          take: 1,
        },
      },
    });

    if (!item) return null;

    return {
      correctText: item.correct_answer_text ?? undefined,
      correctOptionId: item.exercise_options[0]?.option_id,
    };
  }

  // ============ PRIVATE MAPPERS ============

  private toEntity(exercise: any): ExerciseEntity {
    const prompts: ExercisePrompt[] = (exercise.exercise_prompts || []).map(
      (p: any) => ({
        languageId: p.language_id,
        promptText: p.prompt_text,
        promptAssetUrl: p.media_assets?.file_url,
      }),
    );

    return ExerciseEntity.create({
      exerciseId: exercise.exercise_id,
      lessonId: exercise.lesson_id,
      exerciseType: exercise.exercise_type as ExerciseType,
      difficulty: exercise.difficulty ?? EXERCISE_DEFAULTS.DEFAULT_DIFFICULTY,
      points: exercise.points ?? EXERCISE_DEFAULTS.POINTS_PER_CORRECT,
      timeLimitSeconds: exercise.time_limit_seconds ?? undefined,
      createdAt: exercise.created_at,
      updatedAt: exercise.updated_at,
      prompts,
    });
  }

  private toEntityWithItems(exercise: any): ExerciseEntity {
    const prompts: ExercisePrompt[] = (exercise.exercise_prompts || []).map(
      (p: any) => ({
        languageId: p.language_id,
        promptText: p.prompt_text,
        promptAssetUrl: p.media_assets?.file_url,
      }),
    );

    const items: ExerciseItem[] = (exercise.exercise_items || []).map(
      (i: any) => ({
        exerciseItemId: i.exercise_item_id,
        itemOrder: i.item_order,
        itemType: i.item_type as ExerciseItemType,
        correctAnswerText: i.correct_answer_text ?? undefined,
        options: (i.exercise_options || []).map(
          (o: any): ExerciseOption => ({
            optionId: o.option_id,
            optionText: o.option_text,
            optionAssetUrl: o.media_assets?.file_url,
            isCorrect: o.is_correct ?? false,
          }),
        ),
      }),
    );

    return ExerciseEntity.create({
      exerciseId: exercise.exercise_id,
      lessonId: exercise.lesson_id,
      exerciseType: exercise.exercise_type as ExerciseType,
      difficulty: exercise.difficulty ?? EXERCISE_DEFAULTS.DEFAULT_DIFFICULTY,
      points: exercise.points ?? EXERCISE_DEFAULTS.POINTS_PER_CORRECT,
      timeLimitSeconds: exercise.time_limit_seconds ?? undefined,
      createdAt: exercise.created_at,
      updatedAt: exercise.updated_at,
      prompts,
      items,
    });
  }
}
