import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { UserController } from '../src/modules/user/user.controller';
import { UserSettingsController } from '../src/modules/user/user-settings.controller';
import { AdminUserController } from '../src/modules/user/admin-user.controller';
import { UserService } from '../src/modules/user/user.service';
import { RoleGuard } from '../src/common/guards/role.guard';
import { Request, Response, NextFunction } from 'express';

describe('User APIs (e2e)', () => {
  let app: INestApplication<App>;
  let userService: {
    getProfile: jest.Mock;
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
    getPublicProfile: jest.Mock;
    listUsers: jest.Mock;
    getUserById: jest.Mock;
    updateUser: jest.Mock;
    setUserRoles: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      getProfile: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      getPublicProfile: jest.fn(),
      listUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      setUserRoles: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController, UserSettingsController, AdminUserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      const requestWithUser = req as Request & {
        user?: { userId: string; roles: string[] };
      };
      requestWithUser.user = {
        userId: 'user-1',
        roles: ['ADMIN'],
      };
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /users/me returns current user profile', async () => {
    const profile = {
      userId: 'user-1',
      email: 'user@example.com',
      phone: '+84901234567',
      displayName: 'Jane Doe',
      avatarAssetId: 'asset-1',
      status: 'active',
      emailVerified: true,
      dob: new Date('1995-01-15'),
      nativeLanguageId: 1,
      timezone: 'Asia/Ho_Chi_Minh',
      lastLoginAt: new Date('2026-01-13T10:00:00Z'),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-10T00:00:00Z'),
    };

    userService.getProfile.mockResolvedValue(profile);

    const res = await request(app.getHttpServer()).get('/users/me').expect(200);

    expect(userService.getProfile).toHaveBeenCalledWith('user-1');
    expect(res.body).toEqual({
      ...profile,
      dob: profile.dob.toISOString(),
      lastLoginAt: profile.lastLoginAt.toISOString(),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    });
  });

  it('GET /users/settings returns current user settings', async () => {
    const settings = {
      userId: 'user-1',
      displayName: 'Jane Doe',
      avatarAssetId: 'asset-1',
      dob: new Date('1995-01-15'),
      nativeLanguageId: 1,
      timezone: 'Asia/Ho_Chi_Minh',
      updatedAt: new Date('2026-01-10T00:00:00Z'),
    };

    userService.getSettings.mockResolvedValue(settings);

    const res = await request(app.getHttpServer())
      .get('/users/settings')
      .expect(200);

    expect(userService.getSettings).toHaveBeenCalledWith('user-1');
    expect(res.body).toEqual({
      ...settings,
      dob: settings.dob.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    });
  });

  it('PATCH /users/settings updates current user settings', async () => {
    const settings = {
      userId: 'user-1',
      displayName: 'New Name',
      avatarAssetId: 'asset-2',
      dob: new Date('1995-01-15'),
      nativeLanguageId: 2,
      timezone: 'UTC',
      updatedAt: new Date('2026-01-11T00:00:00Z'),
    };

    userService.updateSettings.mockResolvedValue(settings);

    const res = await request(app.getHttpServer())
      .patch('/users/settings')
      .send({
        displayName: 'New Name',
        avatarAssetId: 'asset-2',
        dob: '1995-01-15',
        nativeLanguageId: 2,
        timezone: 'UTC',
      })
      .expect(200);

    expect(userService.updateSettings).toHaveBeenCalledWith('user-1', {
      displayName: 'New Name',
      avatarAssetId: 'asset-2',
      dob: '1995-01-15',
      nativeLanguageId: 2,
      timezone: 'UTC',
    });
    expect(res.body).toEqual({
      ...settings,
      dob: settings.dob.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    });
  });

  it('GET /users/:userId/public returns public profile', async () => {
    const publicProfile = {
      userId: 'user-2',
      displayName: 'Public User',
      avatarAssetId: 'asset-3',
      status: 'active',
      createdAt: new Date('2026-01-02T00:00:00Z'),
    };

    userService.getPublicProfile.mockResolvedValue(publicProfile);

    const res = await request(app.getHttpServer())
      .get('/users/user-2/public')
      .expect(200);

    expect(userService.getPublicProfile).toHaveBeenCalledWith('user-2');
    expect(res.body).toEqual({
      ...publicProfile,
      createdAt: publicProfile.createdAt.toISOString(),
    });
  });

  it('GET /admin/users returns list of users', async () => {
    const listResponse = {
      items: [
        {
          userId: 'user-1',
          email: 'user@example.com',
          phone: '+84901234567',
          displayName: 'Jane Doe',
          avatarAssetId: 'asset-1',
          status: 'active',
          emailVerified: true,
          dob: new Date('1995-01-15'),
          nativeLanguageId: 1,
          timezone: 'UTC',
          lastLoginAt: new Date('2026-01-13T10:00:00Z'),
          createdAt: new Date('2026-01-01T00:00:00Z'),
          updatedAt: new Date('2026-01-10T00:00:00Z'),
          roles: ['ADMIN'],
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    };

    userService.listUsers.mockResolvedValue(listResponse);

    const res = await request(app.getHttpServer())
      .get('/admin/users?page=1&limit=20')
      .expect(200);

    expect(userService.listUsers).toHaveBeenCalled();
    expect(res.body.items[0].createdAt).toBe(
      listResponse.items[0].createdAt.toISOString(),
    );
    expect(res.body.total).toBe(1);
  });

  it('GET /admin/users/:userId returns user details', async () => {
    const adminUser = {
      userId: 'user-2',
      email: 'admin@example.com',
      phone: '+84900000000',
      displayName: 'Admin User',
      avatarAssetId: 'asset-9',
      status: 'active',
      emailVerified: true,
      dob: new Date('1990-01-01'),
      nativeLanguageId: 1,
      timezone: 'UTC',
      lastLoginAt: new Date('2026-01-12T10:00:00Z'),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-10T00:00:00Z'),
      roles: ['ADMIN', 'INSTRUCTOR'],
    };

    userService.getUserById.mockResolvedValue(adminUser);

    const res = await request(app.getHttpServer())
      .get('/admin/users/user-2')
      .expect(200);

    expect(userService.getUserById).toHaveBeenCalledWith('user-2');
    expect(res.body.roles).toEqual(['ADMIN', 'INSTRUCTOR']);
  });

  it('PATCH /admin/users/:userId updates user', async () => {
    const updatedUser = {
      userId: 'user-2',
      email: 'new@example.com',
      phone: '+84900000000',
      displayName: 'Updated User',
      avatarAssetId: 'asset-10',
      status: 'suspended',
      emailVerified: false,
      dob: new Date('1990-01-01'),
      nativeLanguageId: 2,
      timezone: 'UTC',
      lastLoginAt: new Date('2026-01-12T10:00:00Z'),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-13T00:00:00Z'),
      roles: ['STUDENT'],
    };

    userService.updateUser.mockResolvedValue(updatedUser);

    const res = await request(app.getHttpServer())
      .patch('/admin/users/user-2')
      .send({
        email: 'new@example.com',
        displayName: 'Updated User',
        status: 'suspended',
      })
      .expect(200);

    expect(userService.updateUser).toHaveBeenCalledWith('user-2', {
      email: 'new@example.com',
      displayName: 'Updated User',
      status: 'suspended',
    });
    expect(res.body.status).toBe('suspended');
  });

  it('PUT /admin/users/:userId/roles replaces roles', async () => {
    const rolesResponse = {
      userId: 'user-2',
      roles: ['ADMIN', 'INSTRUCTOR'],
    };

    userService.setUserRoles.mockResolvedValue(rolesResponse);

    const res = await request(app.getHttpServer())
      .put('/admin/users/user-2/roles')
      .send({ roles: ['ADMIN', 'INSTRUCTOR'] })
      .expect(200);

    expect(userService.setUserRoles).toHaveBeenCalledWith('user-2', {
      roles: ['ADMIN', 'INSTRUCTOR'],
    });
    expect(res.body).toEqual(rolesResponse);
  });
});
