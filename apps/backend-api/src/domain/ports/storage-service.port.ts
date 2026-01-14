/**
 * Storage Service Port (Interface)
 * Abstract interface for object storage (R2, S3, GCS, etc.)
 * Domain layer không phụ thuộc vào implementation cụ thể
 */

export interface UploadFileOptions {
  folder: string;
  filename: string;
  buffer: Buffer;
  mimetype: string;
  userId?: string;
}

export interface UploadResult {
  assetId: string;
  fileUrl: string;
  publicUrl: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
}

export interface DeleteFileOptions {
  fileUrl: string;
}

export interface GetSignedUrlOptions {
  fileUrl: string;
  expiresIn?: number; // seconds
}

export abstract class IStorageService {
  /**
   * Upload file to storage
   */
  abstract upload(options: UploadFileOptions): Promise<UploadResult>;

  /**
   * Delete file from storage
   */
  abstract delete(options: DeleteFileOptions): Promise<void>;

  /**
   * Get signed URL for private files
   */
  abstract getSignedUrl(options: GetSignedUrlOptions): Promise<string>;

  /**
   * Check if file exists
   */
  abstract exists(fileUrl: string): Promise<boolean>;
}
