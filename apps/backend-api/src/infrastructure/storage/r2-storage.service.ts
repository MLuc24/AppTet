import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash, randomUUID } from 'crypto';
import {
  IStorageService,
  UploadFileOptions,
  UploadResult,
  DeleteFileOptions,
  GetSignedUrlOptions,
} from '../../domain/ports/storage-service.port';

/**
 * R2 Storage Service Implementation
 * Adapter cho Cloudflare R2 (S3-compatible)
 * Implements IStorageService port từ domain layer
 */
@Injectable()
export class R2StorageService implements IStorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client?: S3Client;
  private readonly isConfigured: boolean;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Try to get from ConfigService first, fallback to process.env
    const endpoint = this.configService.get<string>('R2_ENDPOINT') || process.env.R2_ENDPOINT;
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY') || process.env.R2_ACCESS_KEY;
    const secretAccessKey = this.configService.get<string>('R2_SECRET_KEY') || process.env.R2_SECRET_KEY;

    this.bucket = this.configService.get<string>('R2_BUCKET') || process.env.R2_BUCKET || 'lms-files';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || process.env.R2_PUBLIC_URL || '';

    // Debug log
    this.logger.log(`R2_ENDPOINT from config: ${endpoint}`);
    this.logger.log(`R2_BUCKET: ${this.bucket}`);
    this.logger.log(`process.env.R2_ENDPOINT: ${process.env.R2_ENDPOINT}`);

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      this.isConfigured = false;
      this.logger.warn(
        'R2 configuration is missing. Upload endpoints will be disabled until R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY are set.',
      );
      return;
    }

    this.isConfigured = true;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log('R2 Storage Service initialized successfully');
  }

  /**
   * Upload file to R2
   */
  async upload(options: UploadFileOptions): Promise<UploadResult> {
    this.assertConfigured();
    const { folder, filename, buffer, mimetype, userId } = options;

    // Generate unique key with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = this.sanitizeFilename(filename);
    const key = `${folder}/${timestamp}-${sanitizedFilename}`;

    // Calculate checksum (SHA-256)
    const checksum = createHash('sha256').update(buffer).digest('hex');

    // Generate asset ID
    const assetId = randomUUID();

    try {
      // Upload to R2
      await this.s3Client!.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
          Metadata: {
            assetId,
            userId: userId || 'system',
            uploadedAt: new Date().toISOString(),
            checksum,
          },
        }),
      );

      this.logger.log(`File uploaded successfully: ${key}`);

      const fileUrl = `${this.bucket}/${key}`;
      const publicUrl = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : `https://${this.bucket}.r2.cloudflarestorage.com/${key}`;

      return {
        assetId,
        fileUrl,
        publicUrl,
        mimeType: mimetype,
        fileSize: buffer.length,
        checksum,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete file from R2
   */
  async delete(options: DeleteFileOptions): Promise<void> {
    this.assertConfigured();
    const { fileUrl } = options;

    // Extract key from fileUrl (format: bucket/path/to/file)
    const key = this.extractKeyFromUrl(fileUrl);

    try {
      await this.s3Client!.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get signed URL for private files
   * Use for temporary access to files
   */
  async getSignedUrl(options: GetSignedUrlOptions): Promise<string> {
    this.assertConfigured();
    const { fileUrl, expiresIn = 3600 } = options;

    const key = this.extractKeyFromUrl(fileUrl);

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client!, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${key}`, error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Check if file exists in R2
   */
  async exists(fileUrl: string): Promise<boolean> {
    this.assertConfigured();
    const key = this.extractKeyFromUrl(fileUrl);

    try {
      await this.s3Client!.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Extract key from fileUrl
   * fileUrl format: "bucket/path/to/file" or full URL
   */
  private extractKeyFromUrl(fileUrl: string): string {
    // If it's already a key (bucket/path/to/file)
    if (fileUrl.startsWith(this.bucket + '/')) {
      return fileUrl.replace(this.bucket + '/', '');
    }

    // If it's a full URL, extract the key
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;
      // Remove leading slash
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      // If not a valid URL, assume it's already a key
      return fileUrl;
    }
  }

  /**
   * Sanitize filename to prevent security issues
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  private assertConfigured(): void {
    if (!this.isConfigured || !this.s3Client) {
      throw new Error(
        'R2 is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY to enable uploads.',
      );
    }
  }
}
