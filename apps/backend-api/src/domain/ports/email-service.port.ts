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
  name: string;
  verificationLink: string;
}

export interface PasswordResetData {
  email: string;
  name: string;
  resetLink: string;
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
   * Send password reset email
   */
  abstract sendPasswordResetEmail(data: PasswordResetData): Promise<void>;

  /**
   * Send welcome email after registration
   */
  abstract sendWelcomeEmail(email: string, name: string): Promise<void>;

  /**
   * Send password changed confirmation
   */
  abstract sendPasswordChangedEmail(email: string, name: string): Promise<void>;
}
