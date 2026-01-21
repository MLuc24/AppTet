import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeviceEntity } from '../../domain/entities/device.entity';
import { DeviceRepository } from '../../infrastructure/database/repositories/device.repository';
import { PushTokenRepository } from '../../infrastructure/database/repositories/push-token.repository';
import { NotificationRepository } from '../../infrastructure/database/repositories/notification.repository';
import { FirebaseAdminService } from './firebase-admin.service';
import {
  DeactivatePushTokenDto,
  RegisterPushTokenDto,
  SendTestPushDto,
} from './notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly pushTokenRepository: PushTokenRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async registerPushToken(userId: string, dto: RegisterPushTokenDto): Promise<{
    message: string;
    deviceId: string;
  }> {
    if (!dto.platform) {
      throw new BadRequestException('platform is required');
    }

    const deviceFingerprint =
      dto.deviceModel || dto.osVersion
        ? DeviceEntity.generateFingerprint(
            dto.platform,
            dto.deviceModel,
            dto.osVersion,
          )
        : undefined;

    let device = deviceFingerprint
      ? await this.deviceRepository.findByFingerprint(userId, deviceFingerprint)
      : null;

    if (device) {
      device = await this.deviceRepository.update(device.id, {
        deviceModel: dto.deviceModel,
        osVersion: dto.osVersion,
        appVersion: dto.appVersion,
        locale: dto.locale,
      });
      this.logger.log(`Device updated for user ${userId}: ${device.id}`);
    } else {
      device = await this.deviceRepository.create({
        userId,
        platform: dto.platform,
        deviceModel: dto.deviceModel,
        osVersion: dto.osVersion,
        appVersion: dto.appVersion,
        deviceFingerprint,
        locale: dto.locale,
      });
      this.logger.log(`Device registered for user ${userId}: ${device.id}`);
    }

    await this.pushTokenRepository.upsert({
      deviceId: device.id,
      token: dto.token,
      provider: dto.provider,
    });

    const tokenSuffix = dto.token.slice(-6);
    this.logger.log(
      `Push token registered for user ${userId} device ${device.id} provider ${dto.provider} tokenSuffix ${tokenSuffix}`,
    );

    return {
      message: 'Push token registered',
      deviceId: device.id,
    };
  }

  async deactivatePushToken(
    userId: string,
    dto: DeactivatePushTokenDto,
  ): Promise<{ message: string }> {
    const count = await this.pushTokenRepository.deactivateByToken(
      userId,
      dto.token,
    );
    const tokenSuffix = dto.token.slice(-6);
    this.logger.log(
      `Push token deactivated for user ${userId} tokenSuffix ${tokenSuffix} count ${count}`,
    );

    return {
      message:
        count > 0
          ? 'Push token deactivated'
          : 'Push token not found for user',
    };
  }

  async sendTestPush(
    userId: string,
    dto: SendTestPushDto,
  ): Promise<{ message: string; successCount: number; failureCount: number }> {
    const tokens = await this.pushTokenRepository.findActiveTokensByUserId(
      userId,
    );

    if (!tokens.length) {
      throw new NotFoundException('No active push tokens for user');
    }

    const title = dto?.title || 'LMS Test Notification';
    const body = dto?.body || 'Hello from Firebase!';

    const result = await this.firebaseAdminService.sendToTokens(tokens, {
      title,
      body,
      data: {
        type: 'test',
      },
    });

    this.logger.log(
      `Test push sent for user ${userId} tokens ${tokens.length} success ${result.successCount} failure ${result.failureCount}`,
    );

    return {
      message: 'Notification sent',
      successCount: result.successCount,
      failureCount: result.failureCount,
    };
  }

  async getSummary(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount =
      await this.notificationRepository.countUnreadByUserId(userId);
    return { unreadCount };
  }
}
