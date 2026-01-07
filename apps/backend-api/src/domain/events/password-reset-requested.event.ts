/**
 * Password Reset Requested Event
 * Emitted when user requests password reset
 */

export interface PasswordResetRequestedEventPayload {
  userId: string;
  email: string;
  requestedAt: Date;
}

export class PasswordResetRequestedEvent {
  public readonly eventType = 'password.reset.requested';
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly data: PasswordResetRequestedEventPayload;

  constructor(data: PasswordResetRequestedEventPayload) {
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
