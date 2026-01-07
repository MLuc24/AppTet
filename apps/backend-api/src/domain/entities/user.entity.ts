/**
 * User Domain Entity
 * Framework-agnostic user representation
 */

export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export interface UserProps {
  id: string;
  email: string;
  username?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  provider: AuthProvider;
  providerId?: string;
  emailVerified: boolean;
  emailVerifyToken?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get username(): string | undefined {
    return this.props.username;
  }

  get passwordHash(): string | undefined {
    return this.props.passwordHash;
  }

  get firstName(): string | undefined {
    return this.props.firstName;
  }

  get lastName(): string | undefined {
    return this.props.lastName;
  }

  get fullName(): string {
    if (this.props.firstName && this.props.lastName) {
      return `${this.props.firstName} ${this.props.lastName}`;
    }
    return this.props.firstName || this.props.lastName || this.props.email;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get provider(): AuthProvider {
    return this.props.provider;
  }

  get providerId(): string | undefined {
    return this.props.providerId;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get emailVerifyToken(): string | undefined {
    return this.props.emailVerifyToken;
  }

  get passwordResetToken(): string | undefined {
    return this.props.passwordResetToken;
  }

  get passwordResetExpiry(): Date | undefined {
    return this.props.passwordResetExpiry;
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

  isPasswordSet(): boolean {
    return !!this.props.passwordHash;
  }

  canLogin(): boolean {
    return (
      this.props.emailVerified || this.props.provider === AuthProvider.GOOGLE
    );
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isInstructor(): boolean {
    return this.props.role === UserRole.INSTRUCTOR;
  }

  hasRole(role: UserRole): boolean {
    return this.props.role === role;
  }

  isPasswordResetTokenValid(): boolean {
    if (!this.props.passwordResetToken || !this.props.passwordResetExpiry) {
      return false;
    }
    return this.props.passwordResetExpiry > new Date();
  }

  // Mutation methods (returns new instance)

  verifyEmail(): UserEntity {
    return new UserEntity({
      ...this.props,
      emailVerified: true,
      emailVerifyToken: undefined,
      updatedAt: new Date(),
    });
  }

  updateLastLogin(): UserEntity {
    return new UserEntity({
      ...this.props,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });
  }

  setPasswordResetToken(token: string, expiryMinutes: number = 60): UserEntity {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + expiryMinutes);

    return new UserEntity({
      ...this.props,
      passwordResetToken: token,
      passwordResetExpiry: expiry,
      updatedAt: new Date(),
    });
  }

  clearPasswordResetToken(): UserEntity {
    return new UserEntity({
      ...this.props,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
      updatedAt: new Date(),
    });
  }

  updatePassword(passwordHash: string): UserEntity {
    return new UserEntity({
      ...this.props,
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
      updatedAt: new Date(),
    });
  }

  // Serialization for response (no sensitive data)
  toPublicObject() {
    return {
      id: this.props.id,
      email: this.props.email,
      username: this.props.username,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      fullName: this.fullName,
      avatar: this.props.avatar,
      role: this.props.role,
      provider: this.props.provider,
      emailVerified: this.props.emailVerified,
      lastLoginAt: this.props.lastLoginAt,
      createdAt: this.props.createdAt,
    };
  }

  toProps(): UserProps {
    return { ...this.props };
  }
}
