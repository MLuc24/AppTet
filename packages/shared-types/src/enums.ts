export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  CONTENT_EDITOR = 'CONTENT_EDITOR',
  MODERATOR = 'MODERATOR',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum LessonType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
}

export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
