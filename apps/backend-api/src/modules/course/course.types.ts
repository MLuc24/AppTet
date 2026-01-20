/**
 * Course Module Types and Constants
 * Shared types and constants for course module
 */

// Repository injection tokens
export const COURSE_REPOSITORY = 'COURSE_REPOSITORY';
export const COURSE_VERSION_REPOSITORY = 'COURSE_VERSION_REPOSITORY';
export const UNIT_REPOSITORY = 'UNIT_REPOSITORY';
export const SKILL_REPOSITORY = 'SKILL_REPOSITORY';
export const LESSON_REPOSITORY = 'LESSON_REPOSITORY';
export const ENROLLMENT_REPOSITORY = 'ENROLLMENT_REPOSITORY';

// API Response messages
export const COURSE_MESSAGES = {
  CREATED: 'Course created successfully',
  UPDATED: 'Course updated successfully',
  DELETED: 'Course deleted successfully',
  PUBLISHED: 'Course published successfully',
  ARCHIVED: 'Course archived successfully',
  NOT_FOUND: 'Course not found',
  CODE_EXISTS: 'Course code already exists',
  NOT_PUBLISHABLE: 'Course does not meet publishing requirements',
} as const;
