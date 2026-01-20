/**
 * Enrollment Domain Entity
 * User course enrollment
 * Maps to learning.enrollments table
 */

export enum EnrollmentStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

export interface EnrollmentProps {
  enrollmentId: string;
  userId: string;
  courseId: string;
  courseVersionId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class EnrollmentEntity {
  private props: EnrollmentProps;

  constructor(props: EnrollmentProps) {
    this.props = props;
  }

  // Getters
  get enrollmentId(): string {
    return this.props.enrollmentId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get courseId(): string {
    return this.props.courseId;
  }

  get courseVersionId(): string {
    return this.props.courseVersionId;
  }

  get status(): EnrollmentStatus {
    return this.props.status;
  }

  get enrolledAt(): Date {
    return this.props.enrolledAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods
  isActive(): boolean {
    return this.props.status === EnrollmentStatus.ONGOING;
  }

  isCompleted(): boolean {
    return this.props.status === EnrollmentStatus.COMPLETED;
  }

  isDropped(): boolean {
    return this.props.status === EnrollmentStatus.DROPPED;
  }

  canDrop(): boolean {
    return this.isActive();
  }

  canComplete(): boolean {
    return this.isActive();
  }

  // Factory method
  static create(
    userId: string,
    courseId: string,
    courseVersionId: string,
  ): EnrollmentEntity {
    const now = new Date();
    return new EnrollmentEntity({
      enrollmentId: '',
      userId,
      courseId,
      courseVersionId,
      status: EnrollmentStatus.ONGOING,
      enrolledAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  toObject(): EnrollmentProps {
    return { ...this.props };
  }

  toJSON(): EnrollmentProps {
    return { ...this.props };
  }
}
