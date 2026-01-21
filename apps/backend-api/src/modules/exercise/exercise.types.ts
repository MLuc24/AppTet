/**
 * Exercise Module Types and Constants
 * Defines enums, constants and injection tokens for exercise feature
 */

// ============ INJECTION TOKENS ============
export const EXERCISE_REPOSITORY = 'EXERCISE_REPOSITORY';
export const SESSION_REPOSITORY = 'SESSION_REPOSITORY';

// ============ ENUMS ============

/**
 * Types of exercises supported in the system
 * Maps to content.exercises.exercise_type column
 */
export enum ExerciseType {
  MCQ = 'mcq',
  FILL_BLANK = 'fill_blank',
  MATCHING = 'matching',
  REORDER = 'reorder',
  TRANSLATION = 'translation',
  LISTENING_MCQ = 'listening_mcq',
  SPEAKING = 'speaking',
  DICTATION = 'dictation',
  WRITING = 'writing',
}

/**
 * Types of exercise items within an exercise
 * Maps to content.exercise_items.item_type column
 */
export enum ExerciseItemType {
  QUESTION = 'question',
  PAIR = 'pair',
  BLANK = 'blank',
  TOKEN = 'token',
}

/**
 * Practice session modes
 * Maps to learning.practice_sessions.mode column
 */
export enum SessionMode {
  LEARN = 'learn',
  REVIEW = 'review',
  TEST = 'test',
}

// ============ MESSAGES ============
export const EXERCISE_MESSAGES = {
  NOT_FOUND: 'Exercise not found',
  ITEM_NOT_FOUND: 'Exercise item not found',
  LESSON_NOT_FOUND: 'Lesson not found',
  SESSION_NOT_FOUND: 'Practice session not found',
  SESSION_ALREADY_COMPLETED: 'Session has already been completed',
  ATTEMPT_NOT_FOUND: 'Attempt not found',
  INVALID_ANSWER: 'Invalid answer format for this exercise type',
  ALREADY_ANSWERED: 'This item has already been answered in this attempt',
} as const;

// ============ DEFAULTS ============
export const EXERCISE_DEFAULTS = {
  POINTS_PER_CORRECT: 10,
  DEFAULT_DIFFICULTY: 1,
  DEFAULT_LANGUAGE_ID: 1,
} as const;
