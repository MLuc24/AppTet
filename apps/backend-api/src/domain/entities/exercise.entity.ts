/**
 * Exercise Domain Entity
 * Represents an exercise within a lesson
 * Maps to content.exercises table
 */

import {
  ExerciseType,
  ExerciseItemType,
} from '../../modules/exercise/exercise.types';

// ============ INTERFACES ============

export interface ExercisePrompt {
  languageId: number;
  promptText: string;
  promptAssetUrl?: string;
}

export interface ExerciseOption {
  optionId: string;
  optionText: string;
  optionAssetUrl?: string;
  isCorrect: boolean;
}

export interface ExerciseItem {
  exerciseItemId: string;
  itemOrder: number;
  itemType: ExerciseItemType;
  correctAnswerText?: string;
  options: ExerciseOption[];
}

export interface ExerciseProps {
  exerciseId: string;
  lessonId: string;
  exerciseType: ExerciseType;
  difficulty: number;
  points: number;
  timeLimitSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
  prompts?: ExercisePrompt[];
  items?: ExerciseItem[];
}

// ============ ENTITY CLASS ============

export class ExerciseEntity {
  private props: ExerciseProps;

  constructor(props: ExerciseProps) {
    this.props = props;
  }

  // Getters
  get exerciseId(): string {
    return this.props.exerciseId;
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get exerciseType(): ExerciseType {
    return this.props.exerciseType;
  }

  get difficulty(): number {
    return this.props.difficulty;
  }

  get points(): number {
    return this.props.points;
  }

  get timeLimitSeconds(): number | undefined {
    return this.props.timeLimitSeconds;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get prompts(): ExercisePrompt[] {
    return this.props.prompts || [];
  }

  get items(): ExerciseItem[] {
    return this.props.items || [];
  }

  // Business Methods
  getPrompt(languageId: number): ExercisePrompt | undefined {
    return this.prompts.find((p) => p.languageId === languageId);
  }

  getItemsSorted(): ExerciseItem[] {
    return [...this.items].sort((a, b) => a.itemOrder - b.itemOrder);
  }

  getTotalPoints(): number {
    return this.items.length * this.points;
  }

  hasTimeLimit(): boolean {
    return !!this.timeLimitSeconds && this.timeLimitSeconds > 0;
  }

  isMCQ(): boolean {
    return (
      this.exerciseType === ExerciseType.MCQ ||
      this.exerciseType === ExerciseType.LISTENING_MCQ
    );
  }

  // Factory method
  static create(props: ExerciseProps): ExerciseEntity {
    return new ExerciseEntity(props);
  }
}
