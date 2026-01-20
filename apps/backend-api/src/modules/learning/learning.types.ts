/**
 * Learning Module Types and Constants
 */

export const ENROLLMENT_REPOSITORY = 'ENROLLMENT_REPOSITORY';
export const LESSON_PROGRESS_REPOSITORY = 'LESSON_PROGRESS_REPOSITORY';

export const LEARNING_MESSAGES = {
  ENROLLED: 'Successfully enrolled in course',
  UNENROLLED: 'Successfully unenrolled from course',
  ALREADY_ENROLLED: 'Already enrolled in this course',
  NOT_ENROLLED: 'Not enrolled in this course',
  ENROLLMENT_NOT_FOUND: 'Enrollment not found',
  COURSE_NOT_FOUND: 'Course not found',
  COURSE_NOT_PUBLISHED: 'Course is not published',
  LESSON_NOT_FOUND: 'Lesson not found',
  LESSON_COMPLETED: 'Lesson completed successfully',
} as const;
