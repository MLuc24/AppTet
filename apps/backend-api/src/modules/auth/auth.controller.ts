/**
 * Auth Controller - Presentation Layer
 * REST API endpoints cho authentication
 * Không chứa business logic, chỉ gọi service
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  CheckEmailDto,
  ResetPasswordDto,
  ChangePasswordDto,
  LogoutDto,
  RegisterResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  MessageResponseDto,
  ErrorResponseDto,
  UserResponseDto,
} from './auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, IpAddress, UserAgent } from '../../common/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    type: ErrorResponseDto,
  })
  async register(
    @Body() dto: RegisterDto,
    @IpAddress() ip?: string,
    @UserAgent() userAgent?: string,
  ): Promise<unknown> {
    return await this.authService.register(dto, ip, userAgent);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified',
    type: ErrorResponseDto,
  })
  async login(
    @Body() dto: LoginDto,
    @IpAddress() ip?: string,
    @UserAgent() userAgent?: string,
  ): Promise<unknown> {
    return await this.authService.login(dto, ip, userAgent);
  }

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
    type: ErrorResponseDto,
  })
  async verifyEmail(
    @Query('token') token: string,
    @Query('email') email: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.verifyEmail(token, email);
    const html = buildVerificationHtml(result.status);
    res.status(HttpStatus.OK).type('text/html').send(html);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if email exists',
    type: MessageResponseDto,
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<unknown> {
    return await this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if email exists (for password reset)' })
  @ApiResponse({
    status: 200,
    description: 'Email existence check',
  })
  async checkEmail(@Body() dto: CheckEmailDto): Promise<unknown> {
    return await this.authService.checkEmailExists(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
    type: ErrorResponseDto,
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<unknown> {
    return await this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password (authenticated)' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid current password',
    type: ErrorResponseDto,
  })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<unknown> {
    return await this.authService.changePassword(userId, dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    type: ErrorResponseDto,
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<unknown> {
    return await this.authService.refreshAccessToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (invalidate refresh token)' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: MessageResponseDto,
  })
  async logout(@Body() dto: LogoutDto): Promise<unknown> {
    return await this.authService.logout(dto.refreshToken);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async getProfile(@CurrentUser('userId') userId: string): Promise<unknown> {
    return await this.authService.getProfile(userId);
  }
}

function buildVerificationHtml(
  status: 'verified' | 'already_verified' | 'invalid',
): string {
  const isVerified = status === 'verified';
  const isAlready = status === 'already_verified';
  const title = isVerified
    ? 'Verification successful'
    : isAlready
      ? 'Email already verified'
      : 'Invalid verification link';
  const message = isVerified
    ? 'Your email has been verified. You can sign in now.'
    : isAlready
      ? 'This email address was verified earlier. You can sign in normally.'
      : 'This verification link is invalid or has expired.';
  const tone = isVerified ? '#16a34a' : isAlready ? '#2563eb' : '#dc2626';
  const icon = isVerified ? 'OK' : isAlready ? 'i' : '!';

  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        background: #f3f4f6;
        color: #111827;
      }
      .wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        max-width: 520px;
        width: 100%;
        background: #ffffff;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        text-align: center;
      }
      .icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        border-radius: 999px;
        background: ${tone};
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 700;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 22px;
      }
      p {
        margin: 0 0 20px;
        color: #4b5563;
      }
      .cta {
        display: inline-block;
        padding: 12px 20px;
        border-radius: 10px;
        background: #111827;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="icon">${icon}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a class="cta" href="/">Go to homepage</a>
      </div>
    </div>
  </body>
</html>`;
}
