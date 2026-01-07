/**
 * User Domain Entity
 * Framework-agnostic user representation
 * Maps to auth.users table
 */

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export interface UserProps {
  userId: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  displayName: string;
  avatarAssetId?: string;
  status: UserStatus;
  dob?: Date;
  nativeLanguageId?: number;
  timezone: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get avatarAssetId(): string | undefined {
    return this.props.avatarAssetId;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get dob(): Date | undefined {
    return this.props.dob;
  }

  get nativeLanguageId(): number | undefined {
    return this.props.nativeLanguageId;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods
  isActive(): boolean {
    return this.props.status === UserStatus.ACTIVE;
  }

  isSuspended(): boolean {
    return this.props.status === UserStatus.SUSPENDED;
  }

  isDeleted(): boolean {
    return this.props.status === UserStatus.DELETED;
  }

  hasEmail(): boolean {
    return !!this.props.email;
  }

  hasPhone(): boolean {
    return !!this.props.phone;
  }

  // Mutation methods (returns new instance)
  updateLastLogin(): UserEntity {
    return new UserEntity({
      ...this.props,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });
  }

  updatePassword(passwordHash: string): UserEntity {
    return new UserEntity({
      ...this.props,
      passwordHash,
      updatedAt: new Date(),
    });
  }

  updateDisplayName(displayName: string): UserEntity {
    return new UserEntity({
      ...this.props,
      displayName,
      updatedAt: new Date(),
    });
  }

  suspend(): UserEntity {
    return new UserEntity({
      ...this.props,
      status: UserStatus.SUSPENDED,
      updatedAt: new Date(),
    });
  }

  activate(): UserEntity {
    return new UserEntity({
      ...this.props,
      status: UserStatus.ACTIVE,
      updatedAt: new Date(),
    });
  }

  softDelete(): UserEntity {
    return new UserEntity({
      ...this.props,
      status: UserStatus.DELETED,
      updatedAt: new Date(),
    });
  }

  // Serialization for response (no sensitive data)
  toPublicObject() {
    return {
      userId: this.props.userId,
      email: this.props.email,
      phone: this.props.phone,
      displayName: this.props.displayName,
      avatarAssetId: this.props.avatarAssetId,
      status: this.props.status,
      dob: this.props.dob,
      timezone: this.props.timezone,
      lastLoginAt: this.props.lastLoginAt,
      createdAt: this.props.createdAt,
    };
  }

  toProps(): UserProps {
    return { ...this.props };
  }
}
