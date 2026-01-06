import { UserRole, CourseLevel, LessonType, ExerciseType, ProgressStatus } from './enums';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  level: CourseLevel;
  thumbnailUrl?: string;
  isPublished: boolean;
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  type: LessonType;
  order: number;
  xpReward: number;
}

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  question: Record<string, unknown>;
  order: number;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  score?: number;
  completedAt?: string;
}
