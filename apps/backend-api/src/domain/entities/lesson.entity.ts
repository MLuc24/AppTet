/**
 * Lesson Domain Entity
 * Individual lesson containing exercises
 * Maps to content.lessons table
 */

export enum LessonType {
  PRACTICE = 'practice',
  STORY = 'story',
  DIALOGUE = 'dialogue',
  TEST = 'test',
  REVIEW = 'review',
}

export interface LessonLocalization {
  languageId: number;
  title: string;
  introText?: string;
}

export interface LessonProps {
  lessonId: string;
  skillId: string;
  lessonType: LessonType;
  orderIndex: number;
  estimatedMinutes?: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  localizations?: LessonLocalization[];
}

export class LessonEntity {
  private props: LessonProps;

  constructor(props: LessonProps) {
    this.props = props;
  }

  // Getters
  get lessonId(): string {
    return this.props.lessonId;
  }

  get skillId(): string {
    return this.props.skillId;
  }

  get lessonType(): LessonType {
    return this.props.lessonType;
  }

  get orderIndex(): number {
    return this.props.orderIndex;
  }

  get estimatedMinutes(): number | undefined {
    return this.props.estimatedMinutes;
  }

  get isPublished(): boolean {
    return this.props.isPublished;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get localizations(): LessonLocalization[] {
    return this.props.localizations || [];
  }

  // Business Methods
  getTitle(languageId: number): string | undefined {
    const localization = this.localizations.find(
      (l) => l.languageId === languageId,
    );
    return localization?.title;
  }

  getIntroText(languageId: number): string | undefined {
    const localization = this.localizations.find(
      (l) => l.languageId === languageId,
    );
    return localization?.introText;
  }

  hasLocalization(): boolean {
    return this.localizations.length > 0;
  }

  canPublish(): boolean {
    return this.hasLocalization();
  }

  // Factory method
  static create(
    skillId: string,
    lessonType: LessonType,
    orderIndex: number,
    estimatedMinutes?: number,
  ): LessonEntity {
    return new LessonEntity({
      lessonId: '',
      skillId,
      lessonType,
      orderIndex,
      estimatedMinutes,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toObject(): LessonProps {
    return { ...this.props };
  }
}
