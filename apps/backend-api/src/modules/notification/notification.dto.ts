import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum PushProviderDto {
  APNS = 'apns',
  FCM = 'fcm',
}

export class RegisterPushTokenDto {
  @ApiProperty({ example: 'fcm_token_here' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ enum: PushProviderDto, example: PushProviderDto.FCM })
  @IsEnum(PushProviderDto)
  provider: PushProviderDto;

  @ApiProperty({ example: 'android', enum: ['ios', 'android'] })
  @IsString()
  @IsNotEmpty()
  platform: 'ios' | 'android';

  @ApiPropertyOptional({ example: 'Pixel 8' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceModel?: string;

  @ApiPropertyOptional({ example: '14' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  osVersion?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  appVersion?: string;

  @ApiPropertyOptional({ example: 'en-US' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}

export class DeactivatePushTokenDto {
  @ApiProperty({ example: 'fcm_token_here' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class SendTestPushDto {
  @ApiPropertyOptional({ example: 'LMS Test Notification' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({ example: 'Hello from Firebase!' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  body?: string;
}
