/**
 * RefreshToken Domain Entity
 * Framework-agnostic refresh token representation
 */

export interface RefreshTokenProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export class RefreshTokenEntity {
  private props: RefreshTokenProps;

  constructor(props: RefreshTokenProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Business logic

  isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  toProps(): RefreshTokenProps {
    return { ...this.props };
  }
}
