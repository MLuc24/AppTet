import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IStorageService } from '../../domain/ports/storage-service.port';
import { MediaCategory, MediaUploadResponseDto } from './media.dto';
import { MediaAssetRepository } from '../../infrastructure/database/repositories/media-asset.repository';

/**
 * Media Service
 * Application layer - Orchestrates media upload/management
 */
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  // Allowed MIME types
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private readonly ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
  ];

  private readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  // Max file sizes (bytes)
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  constructor(
    private readonly storageService: IStorageService,
    private readonly mediaAssetRepository: MediaAssetRepository,
  ) {}

  /**
   * Upload media file
   */
  async uploadFile(
    file: Express.Multer.File,
    category: MediaCategory,
    userId: string,
    customFilename?: string,
  ): Promise<MediaUploadResponseDto> {
    // Validate file
    this.validateFile(file, category);

    // Determine filename
    const filename = customFilename || file.originalname;

    // Upload to storage (R2)
    const result = await this.storageService.upload({
      folder: category,
      filename,
      buffer: file.buffer,
      mimetype: file.mimetype,
      userId,
    });

    // Save media asset record to database
    await this.mediaAssetRepository.create({
      assetId: result.assetId,
      storageProvider: 'r2',
      fileUrl: result.fileUrl,
      mimeType: result.mimeType,
      fileSizeBytes: BigInt(result.fileSize),
      checksum: result.checksum,
      createdBy: userId,
    });

    this.logger.log(`File uploaded and saved to DB: ${result.fileUrl} by user ${userId}`);

    return {
      assetId: result.assetId,
      fileUrl: result.fileUrl,
      publicUrl: result.publicUrl,
      mimeType: result.mimeType,
      fileSize: result.fileSize,
      checksum: result.checksum,
    };
  }

  /**
   * Validate file based on category
   */
  private validateFile(file: Express.Multer.File, category: MediaCategory) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check MIME type
    const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isAudio = this.ALLOWED_AUDIO_TYPES.includes(file.mimetype);
    const isVideo = this.ALLOWED_VIDEO_TYPES.includes(file.mimetype);

    if (category === MediaCategory.AVATAR) {
      if (!isImage) {
        throw new BadRequestException(
          `Invalid file type for avatar. Allowed: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
        );
      }
      if (file.size > this.MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          `Avatar file too large. Max size: ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        );
      }
    } else if (
      category === MediaCategory.LESSON_IMAGE ||
      category === MediaCategory.EXERCISE_IMAGE
    ) {
      if (!isImage) {
        throw new BadRequestException('Invalid file type. Expected image.');
      }
      if (file.size > this.MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          `Image file too large. Max size: ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        );
      }
    } else if (
      category === MediaCategory.LESSON_AUDIO ||
      category === MediaCategory.EXERCISE_AUDIO ||
      category === MediaCategory.SUBMISSION_SPEAKING
    ) {
      if (!isAudio) {
        throw new BadRequestException('Invalid file type. Expected audio.');
      }
      if (file.size > this.MAX_AUDIO_SIZE) {
        throw new BadRequestException(
          `Audio file too large. Max size: ${this.MAX_AUDIO_SIZE / 1024 / 1024}MB`,
        );
      }
    } else if (category === MediaCategory.LESSON_VIDEO) {
      if (!isVideo) {
        throw new BadRequestException('Invalid file type. Expected video.');
      }
      if (file.size > this.MAX_VIDEO_SIZE) {
        throw new BadRequestException(
          `Video file too large. Max size: ${this.MAX_VIDEO_SIZE / 1024 / 1024}MB`,
        );
      }
    }
  }
}
