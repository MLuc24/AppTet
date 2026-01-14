import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { MediaAssetRepository } from '../../infrastructure/database/repositories/media-asset.repository';
import { PrismaClient } from '@prisma/client';

/**
 * Media Module
 * Handles media file uploads and management
 */
@Module({
  imports: [StorageModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaAssetRepository,
    PrismaClient,
  ],
  exports: [MediaService],
})
export class MediaModule {}
