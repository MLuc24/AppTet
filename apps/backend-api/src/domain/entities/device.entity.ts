/**
 * Device Domain Entity
 */

export type Platform = 'ios' | 'android';

export interface DeviceProps {
  id: string;
  userId: string;
  platform: Platform;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  deviceFingerprint?: string;
  locale?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DeviceEntity {
  private props: DeviceProps;

  constructor(props: DeviceProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get platform(): Platform {
    return this.props.platform;
  }

  get deviceModel(): string | undefined {
    return this.props.deviceModel;
  }

  get osVersion(): string | undefined {
    return this.props.osVersion;
  }

  get appVersion(): string | undefined {
    return this.props.appVersion;
  }

  get deviceFingerprint(): string | undefined {
    return this.props.deviceFingerprint;
  }

  get locale(): string | undefined {
    return this.props.locale;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Generate a unique fingerprint for this device
   */
  static generateFingerprint(
    platform: Platform,
    deviceModel?: string,
    osVersion?: string,
  ): string {
    const parts = [platform, deviceModel || 'unknown', osVersion || 'unknown'];
    return Buffer.from(parts.join('-')).toString('base64');
  }

  toProps(): DeviceProps {
    return { ...this.props };
  }
}
