/**
 * CourseVersion Domain Entity
 * Manages versioning for courses (draft/published/archived)
 * Maps to content.course_versions table
 */

export enum CourseVersionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface CourseVersionProps {
  courseVersionId: string;
  courseId: string;
  versionNumber: number;
  status: CourseVersionStatus;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CourseVersionEntity {
  private props: CourseVersionProps;

  constructor(props: CourseVersionProps) {
    this.props = props;
  }

  // Getters
  get courseVersionId(): string {
    return this.props.courseVersionId;
  }

  get courseId(): string {
    return this.props.courseId;
  }

  get versionNumber(): number {
    return this.props.versionNumber;
  }

  get status(): CourseVersionStatus {
    return this.props.status;
  }

  get publishedAt(): Date | undefined {
    return this.props.publishedAt;
  }

  get createdBy(): string | undefined {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods
  isDraft(): boolean {
    return this.props.status === CourseVersionStatus.DRAFT;
  }

  isPublished(): boolean {
    return this.props.status === CourseVersionStatus.PUBLISHED;
  }

  isArchived(): boolean {
    return this.props.status === CourseVersionStatus.ARCHIVED;
  }

  canPublish(): boolean {
    return this.isDraft();
  }

  canArchive(): boolean {
    return this.isPublished();
  }

  canEdit(): boolean {
    return this.isDraft();
  }

  // Factory method
  static createDraft(
    courseId: string,
    versionNumber: number,
    createdBy?: string,
  ): CourseVersionEntity {
    return new CourseVersionEntity({
      courseVersionId: '',
      courseId,
      versionNumber,
      status: CourseVersionStatus.DRAFT,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toObject(): CourseVersionProps {
    return { ...this.props };
  }
}
