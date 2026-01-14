import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import type { Request, Response, NextFunction } from 'express';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';

describe('Auth APIs (e2e)', () => {
  let app: INestApplication<App>;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    verifyEmail: jest.Mock;
    forgotPassword: jest.Mock;
    checkEmailExists: jest.Mock;
    resetPassword: jest.Mock;
    changePassword: jest.Mock;
    refreshAccessToken: jest.Mock;
    logout: jest.Mock;
    getProfile: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      checkEmailExists: jest.fn(),
      resetPassword: jest.fn(),
      changePassword: jest.fn(),
      refreshAccessToken: jest.fn(),
      logout: jest.fn(),
      getProfile: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
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

  it('POST /auth/register registers user', async () => {
    const response = {
      user: {
        userId: 'user-1',
        displayName: 'Jane Doe',
      },
      message: 'Registration successful',
    };

    authService.register.mockResolvedValue(response);

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'SecurePass123!',
        displayName: 'Jane Doe',
      })
      .expect(201);

    expect(authService.register).toHaveBeenCalled();
    expect(res.body).toEqual(response);
  });

  it('POST /auth/login returns tokens', async () => {
    const response = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
      user: {
        userId: 'user-1',
        displayName: 'Jane Doe',
      },
    };

    authService.login.mockResolvedValue(response);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'SecurePass123!',
      })
      .expect(200);

    expect(authService.login).toHaveBeenCalled();
    expect(res.body).toEqual(response);
  });

  it('GET /auth/verify-email returns html response', async () => {
    authService.verifyEmail.mockResolvedValue({ status: 'verified' });

    const res = await request(app.getHttpServer())
      .get('/auth/verify-email?token=token-123&email=user@example.com')
      .expect(200);

    expect(authService.verifyEmail).toHaveBeenCalledWith(
      'token-123',
      'user@example.com',
    );
    expect(res.text).toContain('Verification successful');
  });

  it('POST /auth/forgot-password sends reset email', async () => {
    authService.forgotPassword.mockResolvedValue({
      message: 'Password reset email sent if email exists',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'user@example.com' })
      .expect(200);

    expect(authService.forgotPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
    expect(res.body.message).toBe('Password reset email sent if email exists');
  });

  it('POST /auth/check-email checks email exists', async () => {
    authService.checkEmailExists.mockResolvedValue({ exists: true });

    const res = await request(app.getHttpServer())
      .post('/auth/check-email')
      .send({ email: 'user@example.com' })
      .expect(200);

    expect(authService.checkEmailExists).toHaveBeenCalledWith('user@example.com');
    expect(res.body).toEqual({ exists: true });
  });

  it('POST /auth/reset-password resets password', async () => {
    authService.resetPassword.mockResolvedValue({
      message: 'Password reset successfully',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        email: 'user@example.com',
        otpCode: '123456',
        newPassword: 'NewSecurePass123!',
      })
      .expect(200);

    expect(authService.resetPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      otpCode: '123456',
      newPassword: 'NewSecurePass123!',
    });
    expect(res.body).toEqual({ message: 'Password reset successfully' });
  });

  it('POST /auth/change-password changes password', async () => {
    authService.changePassword.mockResolvedValue({
      message: 'Password changed successfully',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/change-password')
      .send({
        currentPassword: 'OldPass123!',
        newPassword: 'NewSecurePass123!',
      })
      .expect(200);

    expect(authService.changePassword).toHaveBeenCalledWith('user-1', {
      currentPassword: 'OldPass123!',
      newPassword: 'NewSecurePass123!',
    });
    expect(res.body).toEqual({ message: 'Password changed successfully' });
  });

  it('POST /auth/refresh refreshes tokens', async () => {
    const response = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 900,
    };

    authService.refreshAccessToken.mockResolvedValue(response);

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'refresh-token' })
      .expect(200);

    expect(authService.refreshAccessToken).toHaveBeenCalledWith('refresh-token');
    expect(res.body).toEqual(response);
  });

  it('POST /auth/logout logs out user', async () => {
    authService.logout.mockResolvedValue({ message: 'Logged out successfully' });

    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken: 'refresh-token' })
      .expect(200);

    expect(authService.logout).toHaveBeenCalledWith('refresh-token');
    expect(res.body).toEqual({ message: 'Logged out successfully' });
  });

  it('GET /auth/profile returns current user profile', async () => {
    const profile = {
      userId: 'user-1',
      displayName: 'Jane Doe',
      status: 'active',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };

    authService.getProfile.mockResolvedValue(profile);

    const res = await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(200);

    expect(authService.getProfile).toHaveBeenCalledWith('user-1');
    expect(res.body).toEqual({
      ...profile,
      createdAt: profile.createdAt.toISOString(),
    });
  });
});
