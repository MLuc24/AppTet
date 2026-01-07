/**
 * User Registered Event
 * Emitted when a new user registers
 */

export interface UserRegisteredEventPayload {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  provider: 'LOCAL' | 'GOOGLE';
  registeredAt: Date;
}

export class UserRegisteredEvent {
  public readonly eventType = 'user.registered';
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly data: UserRegisteredEventPayload;

  constructor(data: UserRegisteredEventPayload) {
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
