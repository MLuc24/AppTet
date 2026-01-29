/**
 * Practice Session Domain Entity
 * Represents a learning session for a lesson
 * Maps to learning.practice_sessions table
 */

import { SessionMode } from '../../modules/exercise/exercise.types';

// ============ INTERFACES ============

export interface AttemptResponse {
  responseId: string;
  exerciseItemId: string;
  submittedText?: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  scoreAwarded: number;
  timeSpentSeconds?: number;
}

export interface Attempt {
  attemptId: string;
  attemptNumber: number;
  totalScore: number;
  maxScore: number;
  completedAt?: Date;
  responses: AttemptResponse[];
}

export interface PracticeSessionProps {
  sessionId: string;
  userId: string;
  lessonId: string;
  mode: SessionMode;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attempts?: Attempt[];
}

// ============ ENTITY CLASS ============

export class PracticeSessionEntity {
  private props: PracticeSessionProps;

  constructor(props: PracticeSessionProps) {
    this.props = props;
  }

  // Getters
  get sessionId(): string {
    return this.props.sessionId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get mode(): SessionMode {
    return this.props.mode;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get endedAt(): Date | undefined {
    return this.props.endedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get attempts(): Attempt[] {
    return this.props.attempts || [];
  }

  // Business Methods
  isCompleted(): boolean {
    return !!this.endedAt;
  }

  getLatestAttempt(): Attempt | undefined {
    if (this.attempts.length === 0) return undefined;
    return this.attempts.reduce((latest, current) =>
      current.attemptNumber > latest.attemptNumber ? current : latest,
    );
  }

  getBestAttempt(): Attempt | undefined {
    if (this.attempts.length === 0) return undefined;
    return this.attempts.reduce((best, current) =>
      current.totalScore > best.totalScore ? current : best,
    );
  }

  getNextAttemptNumber(): number {
    if (this.attempts.length === 0) return 1;
    return Math.max(...this.attempts.map((a) => a.attemptNumber)) + 1;
  }

  getDurationMs(): number | undefined {
    if (!this.endedAt) return undefined;
    return this.endedAt.getTime() - this.startedAt.getTime();
  }

  // Serialization
  toJSON(): PracticeSessionProps {
    return {
      ...this.props,
    };
  }

  // Factory method
  static create(props: PracticeSessionProps): PracticeSessionEntity {
    return new PracticeSessionEntity(props);
  }
}
