/**
 * Email Service Implementation with Resend
 * Infrastructure layer - implements IEmailService port
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IEmailService,
  SendEmailOptions,
  EmailVerificationData,
  PasswordResetData,
} from '../../domain/ports/email-service.port';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail = this.configService.get(
      'EMAIL_FROM',
      'noreply@yourapp.com',
    );
    this.frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
  }

  sendEmail(options: SendEmailOptions): Promise<void> {
    // TODO: Integrate with Resend API
    // For MVP, we just log the email
    this.logger.log(`[EMAIL] To: ${options.to}, Subject: ${options.subject}`);
    this.logger.debug(`[EMAIL] HTML: ${options.html}`);

    // Uncomment when ready to integrate Resend:
    /*
    const resend = new Resend(this.configService.get('RESEND_API_KEY'));
    await resend.emails.send({
      from: this.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    */
    return Promise.resolve();
  }

  async sendVerificationEmail(data: EmailVerificationData): Promise<void> {
    const subject = 'Verify your email address';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0;
            }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome, ${data.name}!</h2>
            <p>Thank you for registering. Please verify your email address to activate your account.</p>
            <a href="${data.verificationLink}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${data.verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: data.email,
      subject,
      html,
      text: `Welcome, ${data.name}! Please verify your email: ${data.verificationLink}`,
    });
  }

  async sendPasswordResetEmail(data: PasswordResetData): Promise<void> {
    const subject = 'Reset your password';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #dc3545; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0;
            }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>Hi ${data.name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="${data.resetLink}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${data.resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <div class="footer">
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: data.email,
      subject,
      html,
      text: `Password reset requested. Reset link: ${data.resetLink}`,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to our platform!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome, ${name}!</h2>
            <p>Your email has been verified successfully.</p>
            <p>You can now start using our platform to learn languages.</p>
            <p>Happy learning!</p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html,
      text: `Welcome, ${name}! Your email has been verified.`,
    });
  }

  async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    const subject = 'Your password was changed';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Changed</h2>
            <p>Hi ${name},</p>
            <p>Your password was successfully changed.</p>
            <p>If you didn't make this change, please contact support immediately.</p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html,
      text: `Hi ${name}, your password was successfully changed.`,
    });
  }
}
