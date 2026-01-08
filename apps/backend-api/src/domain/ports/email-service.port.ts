/**
 * Email Service Port (Interface)
 * Send emails (verification, password reset, etc.)
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailVerificationData {
  email: string;
  name?: string;
  token?: string;
  verificationLink?: string;
}

export interface PasswordResetOtpData {
  email: string;
  name?: string;
  otpCode: string;
  expiresInMinutes?: number;
}

export interface WelcomeEmailData {
  email: string;
  name?: string;
}

export interface PasswordChangedData {
  email: string;
  name?: string;
}

export abstract class IEmailService {
  /**
   * Send generic email
   */
  abstract sendEmail(options: SendEmailOptions): Promise<void>;

  /**
   * Send email verification
   */
  abstract sendVerificationEmail(data: EmailVerificationData): Promise<void>;

  /**
   * Send password reset OTP email
   */
  abstract sendPasswordResetOtpEmail(
    data: PasswordResetOtpData,
  ): Promise<void>;

  /**
   * Send welcome email after registration
   */
  abstract sendWelcomeEmail(data: WelcomeEmailData): Promise<void>;

  /**
   * Send password changed confirmation
   */
  abstract sendPasswordChangedEmail(
    data: PasswordChangedData,
  ): Promise<void>;
}
