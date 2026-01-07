/**
 * Auth Module Types and Constants
 */

export const AUTH_CONSTANTS = {
  PASSWORD_RESET_EXPIRY_MINUTES: 60,
  EMAIL_VERIFY_EXPIRY_HOURS: 24,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
} as const;

export const RATE_LIMITS = {
  LOGIN: { max: 10, window: 15 * 60 }, // 10 requests per 15 minutes
  REGISTER: { max: 5, window: 60 * 60 }, // 5 requests per hour
  FORGOT_PASSWORD: { max: 3, window: 60 * 60 }, // 3 requests per hour
} as const;
