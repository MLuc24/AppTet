/**
 * Notification Write DTOs
 * Request and Response DTOs for notification write operations
 */

import { ApiProperty } from '@nestjs/swagger';

export class MarkNotificationReadResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  notificationId: string;

  @ApiProperty()
  readAt: Date;
}

export class MarkAllNotificationsReadResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  markedCount: number;
}
