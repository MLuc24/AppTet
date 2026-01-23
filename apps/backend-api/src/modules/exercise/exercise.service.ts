/**
 * Exercise Service
 * Business logic orchestration for exercise and practice session operations
 */

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IExerciseRepository } from '../../domain/ports/exercise-repository.port';
import { IPracticeSessionRepository } from '../../domain/ports/practice-session-repository.port';
import { ILessonRepository } from '../../domain/ports/lesson-repository.port';
import { ExerciseEntity } from '../../domain/entities/exercise.entity';
import { PracticeSessionEntity } from '../../domain/entities/practice-session.entity';
import {
  EXERCISE_REPOSITORY,
  SESSION_REPOSITORY,
  EXERCISE_MESSAGES,
  EXERCISE_DEFAULTS,
  ExerciseType,
} from './exercise.types';
import { LESSON_REPOSITORY } from '../lesson/lesson.types';
import {
  GetExercisesQueryDto,
  StartSessionDto,
  SubmitAnswerDto,
  SubmitAttemptDto,
  ExerciseResponseDto,
  ExerciseDetailResponseDto,
  ExerciseListResponseDto,
  ExerciseItemResponseDto,
  ExerciseOptionResponseDto,
  SubmitAnswerResponseDto,
  SessionResponseDto,
  AttemptResponseDto,
  AttemptResultDto,
  ResponseResultDto,
  CompleteSessionResponseDto,
} from './exercise.dto';

@Injectable()
export class ExerciseService {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: IPracticeSessionRepository,
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  // ============ EXERCISE QUERIES ============

  async getExercisesByLesson(
    lessonId: string,
    query: GetExercisesQueryDto,
  ): Promise<ExerciseListResponseDto> {
    const languageId = query.languageId ?? EXERCISE_DEFAULTS.DEFAULT_LANGUAGE_ID;

    const [exercises, total] = await Promise.all([
      this.exerciseRepository.findByLessonId(lessonId, languageId),
      this.exerciseRepository.countByLessonId(lessonId),
    ]);

    return {
      data: exercises.map((e) => this.toExerciseResponse(e, languageId)),
      total,
    };
  }

  async getExerciseDetail(
    exerciseId: string,
    languageId?: number,
  ): Promise<ExerciseDetailResponseDto> {
    const langId = languageId ?? EXERCISE_DEFAULTS.DEFAULT_LANGUAGE_ID;
    const exercise = await this.exerciseRepository.findByIdWithItems(exerciseId, langId);

    if (!exercise) {
      throw new NotFoundException(EXERCISE_MESSAGES.NOT_FOUND);
    }

    return this.toExerciseDetailResponse(exercise, langId);
  }

  // ============ SESSION MANAGEMENT ============

  async startSession(
    userId: string,
    lessonId: string,
    dto: StartSessionDto,
  ): Promise<SessionResponseDto> {
    // Verify lesson exists
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(EXERCISE_MESSAGES.LESSON_NOT_FOUND);
    }

    // Check if there's an active session
    const existingSession = await this.sessionRepository.findActiveByUserAndLesson(
      userId,
      lessonId,
    );

    if (existingSession) {
      // Return existing active session
      return this.toSessionResponse(existingSession);
    }

    // Create new session
    const session = await this.sessionRepository.createSession({
      userId,
      lessonId,
      mode: dto.mode,
    });

    return this.toSessionResponse(session);
  }

  async getSession(sessionId: string): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(EXERCISE_MESSAGES.SESSION_NOT_FOUND);
    }
    return this.toSessionResponse(session);
  }

  async startAttempt(
    userId: string,
    sessionId: string,
  ): Promise<AttemptResponseDto> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(EXERCISE_MESSAGES.SESSION_NOT_FOUND);
    }

    if (session.userId !== userId) {
      throw new NotFoundException(EXERCISE_MESSAGES.SESSION_NOT_FOUND);
    }

    if (session.isCompleted()) {
      throw new BadRequestException(EXERCISE_MESSAGES.SESSION_ALREADY_COMPLETED);
    }

    const attemptNumber = session.getNextAttemptNumber();
    const attempt = await this.sessionRepository.createAttempt({
      sessionId,
      attemptNumber,
    });

    return {
      attemptId: attempt.attemptId,
      attemptNumber: attempt.attemptNumber,
    };
  }

  // ============ ANSWER SUBMISSION ============

  async submitAnswer(
    userId: string,
    attemptId: string,
    dto: SubmitAnswerDto,
  ): Promise<SubmitAnswerResponseDto> {
    // Verify attempt exists and belongs to user
    const attempt = await this.sessionRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundException(EXERCISE_MESSAGES.ATTEMPT_NOT_FOUND);
    }

    // Check if already answered
    const hasAnswered = await this.sessionRepository.hasAnswered(
      attemptId,
      dto.exerciseItemId,
    );
    if (hasAnswered) {
      throw new BadRequestException(EXERCISE_MESSAGES.ALREADY_ANSWERED);
    }

    // Get correct answer
    const correctAnswer = await this.exerciseRepository.getCorrectAnswer(dto.exerciseItemId);
    if (!correctAnswer) {
      throw new NotFoundException(EXERCISE_MESSAGES.ITEM_NOT_FOUND);
    }

    // Evaluate answer
    const { isCorrect, scoreAwarded, correctAnswerText } = this.evaluateAnswer(
      dto,
      correctAnswer,
    );

    // Save response
    await this.sessionRepository.createResponse({
      attemptId,
      exerciseItemId: dto.exerciseItemId,
      submittedText: dto.submittedText,
      selectedOptionId: dto.selectedOptionId,
      isCorrect,
      scoreAwarded,
      timeSpentSeconds: dto.timeSpentSeconds,
    });

    return {
      isCorrect,
      scoreAwarded,
      correctAnswer: correctAnswerText,
    };
  }

  async submitAttempt(
    userId: string,
    attemptId: string,
    dto: SubmitAttemptDto,
  ): Promise<AttemptResultDto> {
    const attempt = await this.sessionRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundException(EXERCISE_MESSAGES.ATTEMPT_NOT_FOUND);
    }

    const results: ResponseResultDto[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const response of dto.responses) {
      const correctAnswer = await this.exerciseRepository.getCorrectAnswer(
        response.exerciseItemId,
      );

      if (!correctAnswer) continue;

      const { isCorrect, scoreAwarded, correctAnswerText } = this.evaluateAnswer(
        response,
        correctAnswer,
      );

      // Check if already answered
      const hasAnswered = await this.sessionRepository.hasAnswered(
        attemptId,
        response.exerciseItemId,
      );

      if (!hasAnswered) {
        await this.sessionRepository.createResponse({
          attemptId,
          exerciseItemId: response.exerciseItemId,
          submittedText: response.submittedText,
          selectedOptionId: response.selectedOptionId,
          isCorrect,
          scoreAwarded,
          timeSpentSeconds: response.timeSpentSeconds,
        });
      }

      results.push({
        exerciseItemId: response.exerciseItemId,
        isCorrect,
        scoreAwarded,
        correctAnswer: correctAnswerText,
      });

      totalScore += scoreAwarded;
      maxScore += EXERCISE_DEFAULTS.POINTS_PER_CORRECT;
    }

    // Complete attempt
    const completedAttempt = await this.sessionRepository.completeAttempt(
      attemptId,
      totalScore,
      maxScore,
    );

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      attemptId: completedAttempt.attemptId,
      totalScore,
      maxScore,
      percentage,
      details: results,
    };
  }

  async completeSession(
    userId: string,
    sessionId: string,
  ): Promise<CompleteSessionResponseDto> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(EXERCISE_MESSAGES.SESSION_NOT_FOUND);
    }

    if (session.userId !== userId) {
      throw new NotFoundException(EXERCISE_MESSAGES.SESSION_NOT_FOUND);
    }

    const completedSession = await this.sessionRepository.completeSession(sessionId);
    const bestAttempt = completedSession.getBestAttempt();

    return {
      sessionId: completedSession.sessionId,
      lessonId: completedSession.lessonId,
      endedAt: completedSession.endedAt!,
      bestScore: bestAttempt?.totalScore ?? 0,
      totalAttempts: completedSession.attempts.length,
    };
  }

  // ============ PRIVATE HELPERS ============

  private evaluateAnswer(
    dto: SubmitAnswerDto,
    correctAnswer: { correctText?: string; correctOptionId?: string },
  ): { isCorrect: boolean; scoreAwarded: number; correctAnswerText?: string } {
    let isCorrect = false;
    let correctAnswerText: string | undefined;

    // MCQ check
    if (dto.selectedOptionId && correctAnswer.correctOptionId) {
      isCorrect = dto.selectedOptionId === correctAnswer.correctOptionId;
      correctAnswerText = correctAnswer.correctOptionId;
    }
    // Text check (case-insensitive, trim whitespace)
    else if (dto.submittedText && correctAnswer.correctText) {
      const submitted = dto.submittedText.trim().toLowerCase();
      const correct = correctAnswer.correctText.trim().toLowerCase();
      isCorrect = submitted === correct;
      correctAnswerText = correctAnswer.correctText;
    }

    const scoreAwarded = isCorrect ? EXERCISE_DEFAULTS.POINTS_PER_CORRECT : 0;

    return { isCorrect, scoreAwarded, correctAnswerText };
  }

  private toExerciseResponse(
    exercise: ExerciseEntity,
    _languageId: number,
  ): ExerciseResponseDto {
    return {
      exerciseId: exercise.exerciseId,
      lessonId: exercise.lessonId,
      exerciseType: exercise.exerciseType,
      difficulty: exercise.difficulty,
      points: exercise.points,
      timeLimitSeconds: exercise.timeLimitSeconds,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }

  private toExerciseDetailResponse(
    exercise: ExerciseEntity,
    languageId: number,
  ): ExerciseDetailResponseDto {
    const prompt = exercise.getPrompt(languageId);
    const items = exercise.getItemsSorted();

    return {
      exerciseId: exercise.exerciseId,
      lessonId: exercise.lessonId,
      exerciseType: exercise.exerciseType,
      difficulty: exercise.difficulty,
      points: exercise.points,
      timeLimitSeconds: exercise.timeLimitSeconds,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
      prompt: prompt
        ? {
            promptText: prompt.promptText,
            promptAssetUrl: prompt.promptAssetUrl,
          }
        : undefined,
      items: items.map((item): ExerciseItemResponseDto => ({
        exerciseItemId: item.exerciseItemId,
        itemOrder: item.itemOrder,
        itemType: item.itemType,
        options: item.options
          .filter((o) => !o.isCorrect || exercise.exerciseType !== ExerciseType.MCQ)
          .map((o): ExerciseOptionResponseDto => ({
            optionId: o.optionId,
            optionText: o.optionText,
            optionAssetUrl: o.optionAssetUrl,
          })),
      })),
    };
  }

  private toSessionResponse(session: PracticeSessionEntity): SessionResponseDto {
    return {
      sessionId: session.sessionId,
      lessonId: session.lessonId,
      mode: session.mode,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    };
  }
}
