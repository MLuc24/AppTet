/**
 * Practice Session Repository Port (Interface)
 * Manages practice sessions and attempts
 */

import {
  PracticeSessionEntity,
  Attempt,
  AttemptResponse,
} from '../entities/practice-session.entity';
import { SessionMode } from '../../modules/exercise/exercise.types';

export interface PracticeSessionRecord {
  sessionId: string;
  lessonId: string;
  startedAt: Date;
  endedAt?: Date;
}

export interface CreateSessionData {
  userId: string;
  lessonId: string;
  mode: SessionMode;
}

export interface CreateAttemptData {
  sessionId: string;
  attemptNumber: number;
}

export interface CreateResponseData {
  attemptId: string;
  exerciseItemId: string;
  submittedText?: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  scoreAwarded: number;
  timeSpentSeconds?: number;
}

export interface IPracticeSessionRepository {
  // Session methods
  findById(sessionId: string): Promise<PracticeSessionEntity | null>;
  findByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<PracticeSessionEntity | null>;
  findActiveByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<PracticeSessionEntity | null>;
  findByUserInRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<PracticeSessionRecord[]>;
  createSession(data: CreateSessionData): Promise<PracticeSessionEntity>;
  completeSession(sessionId: string): Promise<PracticeSessionEntity>;

  // Attempt methods
  createAttempt(data: CreateAttemptData): Promise<Attempt>;
  findAttemptById(attemptId: string): Promise<Attempt | null>;
  completeAttempt(
    attemptId: string,
    totalScore: number,
    maxScore: number,
  ): Promise<Attempt>;

  // Response methods
  createResponse(data: CreateResponseData): Promise<AttemptResponse>;
  findResponsesByAttempt(attemptId: string): Promise<AttemptResponse[]>;
  hasAnswered(attemptId: string, exerciseItemId: string): Promise<boolean>;
}
