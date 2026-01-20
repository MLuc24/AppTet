/**
 * LessonProgress Entity
 * Tracks user progress on individual lessons
 */

export interface LessonProgressProps {
  lessonProgressId: string;
  enrollmentId: string;
  lessonId: string;
  bestScore: number;
  lastScore: number;
  completedAt?: Date;
  attemptsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class LessonProgressEntity {
  constructor(private readonly props: LessonProgressProps) {}

  get lessonProgressId(): string {
    return this.props.lessonProgressId;
  }

  get enrollmentId(): string {
    return this.props.enrollmentId;
  }

  get lessonId(): string {
    return this.props.lessonId;
  }

  get bestScore(): number {
    return this.props.bestScore;
  }

  get lastScore(): number {
    return this.props.lastScore;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get attemptsCount(): number {
    return this.props.attemptsCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isCompleted(): boolean {
    return !!this.props.completedAt;
  }

  toJSON(): LessonProgressProps {
    return { ...this.props };
  }
}
