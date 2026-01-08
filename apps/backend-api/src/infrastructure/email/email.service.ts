/**
 * Email Service Implementation with SMTP (Gmail)
 * Infrastructure layer - implements IEmailService port
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import {
  IEmailService,
  SendEmailOptions,
  EmailVerificationData,
  PasswordResetOtpData,
  WelcomeEmailData,
  PasswordChangedData,
} from '../../domain/ports/email-service.port';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appBaseUrl: string;
  private readonly verificationUrl: string;
  private readonly otpExpiresMinutes: number;
  private readonly mailConfigured: boolean;
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>(
      'MAIL_HOST',
      'smtp.gmail.com',
    );
    const port = parseInt(
      this.configService.get<string>('MAIL_PORT', '587'),
      10,
    );
    const secure = this.configService.get<string>('MAIL_SECURE', '');
    const resolvedSecure =
      secure === ''
        ? port === 465
        : secure.toLowerCase() === 'true';
    const user = this.configService.get<string>('MAIL_USER', '');
    const pass = this.configService.get<string>('MAIL_PASSWORD', '');
    this.mailConfigured = Boolean(user && pass);
    this.transporter = this.mailConfigured
      ? nodemailer.createTransport({
          host,
          port,
          secure: resolvedSecure,
          auth: {
            user,
            pass,
          },
        })
      : null;

    this.fromEmail = this.configService.get<string>(
      'MAIL_FROM',
      'noreply@example.com',
    );
    this.fromName = this.configService.get<string>(
      'MAIL_FROM_NAME',
      'LMS Platform',
    );
    this.appBaseUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    this.verificationUrl = this.configService.get<string>(
      'EMAIL_VERIFICATION_URL',
      `${this.appBaseUrl}/api/v1/auth/verify-email`,
    );
    const configuredOtpExpiry = parseInt(
      this.configService.get<string>(
        'RESET_PASSWORD_OTP_EXPIRES_MINUTES',
        '10',
      ),
      10,
    );
    this.otpExpiresMinutes = Number.isFinite(configuredOtpExpiry)
      ? configuredOtpExpiry
      : 10;

    if (!this.mailConfigured) {
      this.logger.warn(
        'MAIL_USER/MAIL_PASSWORD is not configured; emails will not be delivered.',
      );
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.mailConfigured || !this.transporter) {
      this.logger.warn(
        `Skipping email send to ${options.to} because SMTP is not configured.`,
      );
      return;
    }

    try {
      const from = this.fromName
        ? `${this.fromName} <${this.fromEmail}>`
        : this.fromEmail;
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text ?? this.fallbackText(options.html),
      });

      this.logger.log(
        `Email sent to ${options.to} with subject "${options.subject}"`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email: ${error?.message ?? error}`);
      throw error;
    }
  }

  async sendVerificationEmail(data: EmailVerificationData): Promise<void> {
    const verificationLink = this.buildVerificationLink(
      data.token,
      data.verificationLink,
      data.email,
    );

    if (!verificationLink) {
      throw new Error(
        'Verification token or link is required to send email verification.',
      );
    }

    const subject = 'Verify your email to activate your account';
    const recipientName = data.name || 'there';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="margin-bottom: 12px; color: #111827;">Hi ${recipientName},</h2>
        <p style="margin: 0 0 16px;">Thanks for signing up. Please confirm your email so we can secure your account.</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 20px; background: #2563eb; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify email</a>
        <p style="margin: 16px 0 8px;">If the button doesn't work, copy this link:</p>
        <p style="margin: 0 0 8px; color: #4b5563; word-break: break-all;">${verificationLink}</p>
        <p style="margin: 8px 0 0; font-size: 12px; color: #6b7280;">This link expires in 24 hours.</p>
      </div>
    `;

    await this.sendEmail({
      to: data.email,
      subject,
      html,
      text: `Hi ${recipientName}, confirm your email by opening ${verificationLink}`,
    });
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const subject = 'Welcome aboard!';
    const recipientName = data.name || 'there';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Welcome, ${recipientName}!</h2>
        <p style="margin: 0 0 12px;">Your email has been verified successfully.</p>
        <p style="margin: 0 0 12px;">You can now sign in and start learning.</p>
        <p style="margin: 0;">Visit <a href="${this.appBaseUrl}" style="color: #2563eb; text-decoration: none;">${this.appBaseUrl}</a> to get started.</p>
      </div>
    `;

    await this.sendEmail({
      to: data.email,
      subject,
      html,
      text: `Welcome, ${recipientName}! Your email has been verified. Visit ${this.appBaseUrl} to get started.`,
    });
  }

  async sendPasswordResetOtpEmail(data: PasswordResetOtpData): Promise<void> {
    const otpCode = data.otpCode?.toString().padStart(6, '0');
    if (!otpCode) {
      throw new Error('OTP code is required to send password reset email.');
    }

    const expiresIn = data.expiresInMinutes ?? this.otpExpiresMinutes;
    const recipientName = data.name || 'there';
    const subject = 'Your password reset code';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Reset your password</h2>
        <p style="margin: 0 0 12px;">Use this 6-digit code to continue resetting your password:</p>
        <div style="display: inline-block; padding: 12px 20px; background: #f3f4f6; border-radius: 8px; font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 8px 0 16px;">${otpCode}</div>
        <p style="margin: 0 0 12px;">The code expires in ${expiresIn} minutes.</p>
        <p style="margin: 0; font-size: 12px; color: #6b7280;">If you didn't request this, you can ignore this email.</p>
      </div>
    `;

    await this.sendEmail({
      to: data.email,
      subject,
      html,
      text: `Use this code to reset your password: ${otpCode} (expires in ${expiresIn} minutes).`,
    });
  }

  async sendPasswordChangedEmail(data: PasswordChangedData): Promise<void> {
    const subject = 'Your password was updated';
    const recipientName = data.name || 'there';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Password updated</h2>
        <p style="margin: 0 0 12px;">Hi ${recipientName}, your password was changed successfully.</p>
        <p style="margin: 0;">If this wasn't you, please reset your password immediately.</p>
      </div>
    `;

    await this.sendEmail({
      to: data.email,
      subject,
      html,
      text: `Hi ${recipientName}, your password was changed. If this wasn't you, reset it immediately.`,
    });
  }

  private buildVerificationLink(
    token?: string,
    verificationLink?: string,
    email?: string,
  ): string | null {
    if (verificationLink) {
      return verificationLink;
    }

    if (!token) {
      return null;
    }

    const url = new URL(this.verificationUrl);
    url.searchParams.set('token', token);
    if (email) {
      url.searchParams.set('email', email);
    }
    return url.toString();
  }

  private fallbackText(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
