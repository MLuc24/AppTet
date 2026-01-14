import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import type { Request, Response, NextFunction } from 'express';
import { NotificationController } from '../src/modules/notification/notification.controller';
import { NotificationService } from '../src/modules/notification/notification.service';

describe('Notification APIs (e2e)', () => {
  let app: INestApplication<App>;
  let notificationService: {
    registerPushToken: jest.Mock;
    deactivatePushToken: jest.Mock;
    sendTestPush: jest.Mock;
  };

  beforeEach(async () => {
    notificationService = {
      registerPushToken: jest.fn(),
      deactivatePushToken: jest.fn(),
      sendTestPush: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      const requestWithUser = req as Request & {
        user?: { userId: string; roles: string[] };
      };
      requestWithUser.user = {
        userId: 'user-1',
        roles: ['STUDENT'],
      };
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /notification/push-tokens registers push token', async () => {
    const response = {
      message: 'Push token registered',
      deviceId: 'device-1',
    };

    notificationService.registerPushToken.mockResolvedValue(response);

    const dto = {
      token: 'fcm-token',
      provider: 'fcm',
      platform: 'android',
      deviceModel: 'Pixel 8',
      osVersion: '14',
      appVersion: '1.0.0',
      locale: 'en-US',
    };

    const res = await request(app.getHttpServer())
      .post('/notification/push-tokens')
      .send(dto)
      .expect(201);

    expect(notificationService.registerPushToken).toHaveBeenCalledWith('user-1', dto);
    expect(res.body).toEqual(response);
  });

  it('POST /notification/push-tokens/deactivate deactivates token', async () => {
    const response = { message: 'Push token deactivated' };

    notificationService.deactivatePushToken.mockResolvedValue(response);

    const res = await request(app.getHttpServer())
      .post('/notification/push-tokens/deactivate')
      .send({ token: 'fcm-token' })
      .expect(201);

    expect(notificationService.deactivatePushToken).toHaveBeenCalledWith('user-1', {
      token: 'fcm-token',
    });
    expect(res.body).toEqual(response);
  });

  it('POST /notification/test sends a test notification', async () => {
    const response = {
      message: 'Notification sent',
      successCount: 1,
      failureCount: 0,
    };

    notificationService.sendTestPush.mockResolvedValue(response);

    const res = await request(app.getHttpServer())
      .post('/notification/test')
      .send({ title: 'Test', body: 'Hello' })
      .expect(201);

    expect(notificationService.sendTestPush).toHaveBeenCalledWith('user-1', {
      title: 'Test',
      body: 'Hello',
    });
    expect(res.body).toEqual(response);
  });
});
