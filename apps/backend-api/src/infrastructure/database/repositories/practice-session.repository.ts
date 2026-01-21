/**
 * Practice Session Repository Implementation
 * Prisma-based repository for practice sessions and attempts
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  IPracticeSessionRepository,
  CreateSessionData,
  CreateAttemptData,
  CreateResponseData,
} from '../../../domain/ports/practice-session-repository.port';
import {
  PracticeSessionEntity,
  Attempt,
  AttemptResponse,
} from '../../../domain/entities/practice-session.entity';
import { SessionMode } from '../../../modules/exercise/exercise.types';

@Injectable()
export class PracticeSessionRepository implements IPracticeSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ============ SESSION METHODS ============

  async findById(sessionId: string): Promise<PracticeSessionEntity | null> {
    const session = await this.prisma.practice_sessions.findUnique({
      where: { session_id: sessionId },
      include: {
        attempts: {
          include: {
            attempt_responses: true,
          },
          orderBy: { attempt_number: 'asc' },
        },
      },
    });

    if (!session) return null;
    return this.toEntity(session);
  }

  async findByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<PracticeSessionEntity | null> {
    const session = await this.prisma.practice_sessions.findFirst({
      where: {
        user_id: userId,
        lesson_id: lessonId,
      },
      orderBy: { started_at: 'desc' },
      include: {
        attempts: {
          include: {
            attempt_responses: true,
          },
          orderBy: { attempt_number: 'asc' },
        },
      },
    });

    if (!session) return null;
    return this.toEntity(session);
  }

  async findActiveByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<PracticeSessionEntity | null> {
    const session = await this.prisma.practice_sessions.findFirst({
      where: {
        user_id: userId,
        lesson_id: lessonId,
        ended_at: null,
      },
      orderBy: { started_at: 'desc' },
      include: {
        attempts: {
          include: {
            attempt_responses: true,
          },
          orderBy: { attempt_number: 'asc' },
        },
      },
    });

    if (!session) return null;
    return this.toEntity(session);
  }

  async createSession(data: CreateSessionData): Promise<PracticeSessionEntity> {
    const session = await this.prisma.practice_sessions.create({
      data: {
        user_id: data.userId,
        lesson_id: data.lessonId,
        mode: data.mode,
      },
      include: {
        attempts: true,
      },
    });

    return this.toEntity(session);
  }

  async completeSession(sessionId: string): Promise<PracticeSessionEntity> {
    const session = await this.prisma.practice_sessions.update({
      where: { session_id: sessionId },
      data: {
        ended_at: new Date(),
      },
      include: {
        attempts: {
          include: {
            attempt_responses: true,
          },
          orderBy: { attempt_number: 'asc' },
        },
      },
    });

    return this.toEntity(session);
  }

  // ============ ATTEMPT METHODS ============

  async createAttempt(data: CreateAttemptData): Promise<Attempt> {
    const attempt = await this.prisma.attempts.create({
      data: {
        session_id: data.sessionId,
        attempt_number: data.attemptNumber,
      },
      include: {
        attempt_responses: true,
      },
    });

    return this.toAttempt(attempt);
  }

  async findAttemptById(attemptId: string): Promise<Attempt | null> {
    const attempt = await this.prisma.attempts.findUnique({
      where: { attempt_id: attemptId },
      include: {
        attempt_responses: true,
      },
    });

    if (!attempt) return null;
    return this.toAttempt(attempt);
  }

  async completeAttempt(
    attemptId: string,
    totalScore: number,
    maxScore: number,
  ): Promise<Attempt> {
    const attempt = await this.prisma.attempts.update({
      where: { attempt_id: attemptId },
      data: {
        total_score: totalScore,
        max_score: maxScore,
        completed_at: new Date(),
      },
      include: {
        attempt_responses: true,
      },
    });

    return this.toAttempt(attempt);
  }

  // ============ RESPONSE METHODS ============

  async createResponse(data: CreateResponseData): Promise<AttemptResponse> {
    const response = await this.prisma.attempt_responses.create({
      data: {
        attempt_id: data.attemptId,
        exercise_item_id: data.exerciseItemId,
        submitted_text: data.submittedText,
        selected_option_id: data.selectedOptionId,
        is_correct: data.isCorrect,
        score_awarded: data.scoreAwarded,
        time_spent_seconds: data.timeSpentSeconds,
      },
    });

    return this.toResponse(response);
  }

  async findResponsesByAttempt(attemptId: string): Promise<AttemptResponse[]> {
    const responses = await this.prisma.attempt_responses.findMany({
      where: { attempt_id: attemptId },
    });

    return responses.map((r) => this.toResponse(r));
  }

  async hasAnswered(
    attemptId: string,
    exerciseItemId: string,
  ): Promise<boolean> {
    const count = await this.prisma.attempt_responses.count({
      where: {
        attempt_id: attemptId,
        exercise_item_id: exerciseItemId,
      },
    });

    return count > 0;
  }

  // ============ PRIVATE MAPPERS ============

  private toEntity(session: any): PracticeSessionEntity {
    const attempts: Attempt[] = (session.attempts || []).map((a: any) =>
      this.toAttempt(a),
    );

    return PracticeSessionEntity.create({
      sessionId: session.session_id,
      userId: session.user_id,
      lessonId: session.lesson_id,
      mode: session.mode as SessionMode,
      startedAt: session.started_at,
      endedAt: session.ended_at ?? undefined,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      attempts,
    });
  }

  private toAttempt(attempt: any): Attempt {
    const responses: AttemptResponse[] = (attempt.attempt_responses || []).map(
      (r: any) => this.toResponse(r),
    );

    return {
      attemptId: attempt.attempt_id,
      attemptNumber: attempt.attempt_number,
      totalScore: attempt.total_score ?? 0,
      maxScore: attempt.max_score ?? 0,
      completedAt: attempt.completed_at ?? undefined,
      responses,
    };
  }

  private toResponse(response: any): AttemptResponse {
    return {
      responseId: response.response_id,
      exerciseItemId: response.exercise_item_id,
      submittedText: response.submitted_text ?? undefined,
      selectedOptionId: response.selected_option_id ?? undefined,
      isCorrect: response.is_correct ?? false,
      scoreAwarded: response.score_awarded ?? 0,
      timeSpentSeconds: response.time_spent_seconds ?? undefined,
    };
  }
}
