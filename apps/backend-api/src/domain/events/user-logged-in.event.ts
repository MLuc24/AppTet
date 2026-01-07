/**
 * User Logged In Event
 * Emitted when user successfully logs in
 */

export interface UserLoggedInEventPayload {
  userId: string;
  email: string;
  provider: 'LOCAL' | 'GOOGLE';
  loggedInAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class UserLoggedInEvent {
  public readonly eventType = 'user.logged.in';
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly data: UserLoggedInEventPayload;

  constructor(data: UserLoggedInEventPayload) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
    this.data = data;
  }

  toJSON() {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      occurredAt: this.occurredAt.toISOString(),
      data: this.data,
    };
  }
}
