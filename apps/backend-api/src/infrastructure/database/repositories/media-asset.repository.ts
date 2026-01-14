/**
 * Media Asset Repository Implementation with Prisma
 * Infrastructure layer - handles media_assets table operations
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, media_assets as PrismaMediaAsset } from '@prisma/client';

export interface CreateMediaAssetData {
  assetId: string;
  storageProvider: string;
  fileUrl: string;
  publicUrl?: string;
  mimeType: string;
  fileSizeBytes: bigint;
  checksum: string;
  createdBy: string;
}

export interface MediaAssetEntity {
  assetId: string;
  storageProvider: string;
  fileUrl: string;
  publicUrl?: string;
  mimeType: string;
  fileSizeBytes: bigint;
  checksum: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MediaAssetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMediaAssetData): Promise<MediaAssetEntity> {
    const asset = await this.prisma.media_assets.create({
      data: {
        asset_id: data.assetId,
        storage_provider: data.storageProvider,
        file_url: data.fileUrl,
        public_url: data.publicUrl,
        mime_type: data.mimeType,
        file_size_bytes: data.fileSizeBytes,
        checksum: data.checksum,
        created_by: data.createdBy,
      },
    });

    return this.toDomain(asset);
  }

  async findById(assetId: string): Promise<MediaAssetEntity | null> {
    const asset = await this.prisma.media_assets.findUnique({
      where: { asset_id: assetId },
    });

    return asset ? this.toDomain(asset) : null;
  }

  async delete(assetId: string): Promise<void> {
    await this.prisma.media_assets.delete({
      where: { asset_id: assetId },
    });
  }

  private toDomain(prismaAsset: PrismaMediaAsset): MediaAssetEntity {
    return {
      assetId: prismaAsset.asset_id,
      storageProvider: prismaAsset.storage_provider,
      fileUrl: prismaAsset.file_url,
      publicUrl: prismaAsset.public_url || undefined,
      mimeType: prismaAsset.mime_type,
      fileSizeBytes: prismaAsset.file_size_bytes || BigInt(0),
      checksum: prismaAsset.checksum || '',
      createdBy: prismaAsset.created_by,
      createdAt: prismaAsset.created_at || new Date(),
      updatedAt: prismaAsset.updated_at || new Date(),
    };
  }
}
