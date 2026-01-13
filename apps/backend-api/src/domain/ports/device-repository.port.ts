/**
 * Device Repository Port
 */

import { DeviceEntity, Platform } from '../entities/device.entity';

export interface CreateDeviceData {
  userId: string;
  platform: Platform;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  deviceFingerprint?: string;
  locale?: string;
}

export interface UpdateDeviceData {
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  locale?: string;
}

export abstract class IDeviceRepository {
  abstract create(data: CreateDeviceData): Promise<DeviceEntity>;
  abstract findById(deviceId: string): Promise<DeviceEntity | null>;
  abstract findByFingerprint(
    userId: string,
    deviceFingerprint: string,
  ): Promise<DeviceEntity | null>;
  abstract findByUserId(userId: string): Promise<DeviceEntity[]>;
  abstract update(
    deviceId: string,
    data: UpdateDeviceData,
  ): Promise<DeviceEntity>;
  abstract delete(deviceId: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
