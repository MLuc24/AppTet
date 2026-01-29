import { Body, Controller, Get, Post, Put, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { NotificationService } from './notification.service';
import {
  DeactivatePushTokenDto,
  RegisterPushTokenDto,
  SendTestPushDto,
} from './notification.dto';

@ApiTags('Notifications')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification summary for current user' })
  @ApiResponse({ status: 200, description: 'Notification summary' })
  async getSummary(@CurrentUser('userId') userId: string): Promise<{
    unreadCount: number;
  }> {
    return this.notificationService.getSummary(userId);
  }

  @Post('push-tokens')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register or refresh push token for device' })
  @ApiResponse({ status: 200, description: 'Push token registered' })
  async registerPushToken(
    @CurrentUser('userId') userId: string,
    @Body() dto: RegisterPushTokenDto,
  ): Promise<unknown> {
    return await this.notificationService.registerPushToken(userId, dto);
  }

  @Post('push-tokens/deactivate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate push token for device' })
  @ApiResponse({ status: 200, description: 'Push token deactivated' })
  async deactivatePushToken(
    @CurrentUser('userId') userId: string,
    @Body() dto: DeactivatePushTokenDto,
  ): Promise<unknown> {
    return await this.notificationService.deactivatePushToken(userId, dto);
  }

  @Post('test')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a test push notification to current user' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  async sendTestPush(
    @CurrentUser('userId') userId: string,
    @Body() dto: SendTestPushDto,
  ): Promise<unknown> {
    return await this.notificationService.sendTestPush(userId, dto);
  }

  @Put(':notificationId/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<{ success: boolean; notificationId: string; readAt: Date }> {
    return await this.notificationService.markAsRead(userId, notificationId);
  }

  @Put('read-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(
    @CurrentUser('userId') userId: string,
  ): Promise<{ success: boolean; markedCount: number }> {
    return await this.notificationService.markAllAsRead(userId);
  }
}
