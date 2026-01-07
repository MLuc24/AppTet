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
} from '@nestjs/common';
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
  async register(@Body() dto: RegisterDto): Promise<unknown> {
    const result = await this.authService.register(dto);
    return {
      success: true,
      data: result,
    };
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
  async login(@Body() dto: LoginDto): Promise<unknown> {
    const result = await this.authService.login(dto);
    return {
      success: true,
      data: result,
    };
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
  async verifyEmail(@Query('token') token: string): Promise<unknown> {
    const result = await this.authService.verifyEmail(token);
    return {
      success: true,
      data: result,
    };
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
    const result = await this.authService.forgotPassword(dto);
    return {
      success: true,
      data: result,
    };
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
    const result = await this.authService.resetPassword(dto);
    return {
      success: true,
      data: result,
    };
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
    const result = await this.authService.changePassword(userId, dto);
    return {
      success: true,
      data: result,
    };
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
    const result = await this.authService.refreshAccessToken(dto.refreshToken);
    return {
      success: true,
      data: result,
    };
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
    const result = await this.authService.logout(dto.refreshToken);
    return {
      success: true,
      data: result,
    };
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
    const user = await this.authService.getProfile(userId);
    return {
      success: true,
      data: user,
    };
  }
}
