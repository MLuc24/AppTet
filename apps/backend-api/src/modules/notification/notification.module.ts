import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { FirebaseAdminService } from './firebase-admin.service';
import { DeviceRepository } from '../../infrastructure/database/repositories/device.repository';
import { PushTokenRepository } from '../../infrastructure/database/repositories/push-token.repository';
import { NotificationRepository } from '../../infrastructure/database/repositories/notification.repository';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    FirebaseAdminService,
    PrismaClient,
    DeviceRepository,
    PushTokenRepository,
    NotificationRepository,
  ],
})
export class NotificationModule {}
