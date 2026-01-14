import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { R2StorageService } from './r2-storage.service';
import { IStorageService } from '../../domain/ports/storage-service.port';

/**
 * Storage Module
 * Provides storage service implementation (R2)
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IStorageService,
      useClass: R2StorageService,
    },
  ],
  exports: [IStorageService],
})
export class StorageModule {}
