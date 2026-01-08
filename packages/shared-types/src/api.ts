// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
}

// ==================== AUTH DTOs ====================

// User Response DTO
export interface UserResponseDto {
  userId: string;
  email?: string;
  phone?: string;
  displayName: string;
  avatarAssetId?: string;
  status: 'active' | 'suspended' | 'deleted';
  lastLoginAt?: string; // ISO date string
  createdAt: string; // ISO date string
}

// Register
export interface RegisterRequestDto {
  email?: string;
  phone?: string;
  password: string;
  displayName: string;
}

export interface RegisterResponseDto {
  user: UserResponseDto;
  message: string;
}

// Login
export interface LoginRequestDto {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds (900 = 15 minutes)
  user: UserResponseDto;
}

// Refresh Token
export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  expiresIn: number;
}

// Forgot Password
export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
}

// Reset Password
export interface ResetPasswordRequestDto {
  email: string;
  otpCode: string; // 6 digits
  newPassword: string;
}

export interface ResetPasswordResponseDto {
  message: string;
}

// Change Password
export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponseDto {
  message: string;
}

// Logout
export interface LogoutRequestDto {
  refreshToken: string;
}

export interface LogoutResponseDto {
  message: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
