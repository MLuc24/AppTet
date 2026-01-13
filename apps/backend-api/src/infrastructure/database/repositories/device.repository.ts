/**
 * Device Repository Implementation with Prisma
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, user_devices as PrismaDevice } from '@prisma/client';
import {
  IDeviceRepository,
  CreateDeviceData,
  UpdateDeviceData,
} from '../../../domain/ports/device-repository.port';
import { DeviceEntity, Platform } from '../../../domain/entities/device.entity';

@Injectable()
export class DeviceRepository implements IDeviceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateDeviceData): Promise<DeviceEntity> {
    const device = await this.prisma.user_devices.create({
      data: {
        user_id: data.userId,
        platform: data.platform,
        device_model: data.deviceModel,
        os_version: data.osVersion,
        app_version: data.appVersion,
        device_fingerprint: data.deviceFingerprint,
        locale: data.locale,
      },
    });
    return this.toDomain(device);
  }

  async findById(deviceId: string): Promise<DeviceEntity | null> {
    const device = await this.prisma.user_devices.findUnique({
      where: { device_id: deviceId },
    });
    return device ? this.toDomain(device) : null;
  }

  async findByFingerprint(
    userId: string,
    deviceFingerprint: string,
  ): Promise<DeviceEntity | null> {
    const device = await this.prisma.user_devices.findFirst({
      where: {
        user_id: userId,
        device_fingerprint: deviceFingerprint,
      },
    });
    return device ? this.toDomain(device) : null;
  }

  async findByUserId(userId: string): Promise<DeviceEntity[]> {
    const devices = await this.prisma.user_devices.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
    });
    return devices.map((d) => this.toDomain(d));
  }

  async update(
    deviceId: string,
    data: UpdateDeviceData,
  ): Promise<DeviceEntity> {
    const device = await this.prisma.user_devices.update({
      where: { device_id: deviceId },
      data: {
        device_model: data.deviceModel,
        os_version: data.osVersion,
        app_version: data.appVersion,
        locale: data.locale,
        updated_at: new Date(),
      },
    });
    return this.toDomain(device);
  }

  async delete(deviceId: string): Promise<void> {
    await this.prisma.user_devices.delete({
      where: { device_id: deviceId },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.user_devices.deleteMany({
      where: { user_id: userId },
    });
  }

  private toDomain(prismaDevice: PrismaDevice): DeviceEntity {
    return new DeviceEntity({
      id: prismaDevice.device_id,
      userId: prismaDevice.user_id,
      platform: prismaDevice.platform as Platform,
      deviceModel: prismaDevice.device_model || undefined,
      osVersion: prismaDevice.os_version || undefined,
      appVersion: prismaDevice.app_version || undefined,
      deviceFingerprint: prismaDevice.device_fingerprint || undefined,
      locale: prismaDevice.locale || undefined,
      createdAt: prismaDevice.created_at || new Date(),
      updatedAt: prismaDevice.updated_at || new Date(),
    });
  }
}
