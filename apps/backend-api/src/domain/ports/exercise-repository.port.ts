/**
 * Exercise Repository Port (Interface)
 * Manages exercise operations within lessons
 */

import { ExerciseEntity } from '../entities/exercise.entity';
import { ExerciseType } from '../../modules/exercise/exercise.types';

export interface CreateExerciseData {
  lessonId: string;
  exerciseType: ExerciseType;
  difficulty?: number;
  points?: number;
  timeLimitSeconds?: number;
}

export interface UpdateExerciseData {
  exerciseType?: ExerciseType;
  difficulty?: number;
  points?: number;
  timeLimitSeconds?: number;
}

export interface IExerciseRepository {
  // Query methods
  findById(exerciseId: string, languageId?: number): Promise<ExerciseEntity | null>;
  findByLessonId(lessonId: string, languageId?: number): Promise<ExerciseEntity[]>;
  findByIdWithItems(exerciseId: string, languageId?: number): Promise<ExerciseEntity | null>;
  countByLessonId(lessonId: string): Promise<number>;

  // Command methods
  create(data: CreateExerciseData): Promise<ExerciseEntity>;
  update(exerciseId: string, data: UpdateExerciseData): Promise<ExerciseEntity>;
  delete(exerciseId: string): Promise<void>;

  // Item methods
  getCorrectAnswer(exerciseItemId: string): Promise<{
    correctText?: string;
    correctOptionId?: string;
  } | null>;
}
