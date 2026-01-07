/**
 * Auth Session Domain Entity
 * Maps to auth.auth_sessions table
 */

export interface SessionProps {
  sessionId: string;
  userId: string;
  deviceId?: string;
  accessTokenHash: string;
  ip?: string;
  userAgent?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

export class SessionEntity {
  private props: SessionProps;

  constructor(props: SessionProps) {
    this.props = props;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get deviceId(): string | undefined {
    return this.props.deviceId;
  }

  get accessTokenHash(): string {
    return this.props.accessTokenHash;
  }

  get ip(): string | undefined {
    return this.props.ip;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | undefined {
    return this.props.revokedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  isRevoked(): boolean {
    return !!this.props.revokedAt;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  revoke(): SessionEntity {
    return new SessionEntity({
      ...this.props,
      revokedAt: new Date(),
    });
  }

  toProps(): SessionProps {
    return { ...this.props };
  }
}
