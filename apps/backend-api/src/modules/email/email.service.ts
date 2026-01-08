import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService as ResendEmailService } from '../../infrastructure/email/email.service';

/**
 * Email module service wrapper
 * Reuses the Resend implementation from the infrastructure layer.
 */
@Injectable()
export class EmailService extends ResendEmailService {
  constructor(configService: ConfigService) {
    super(configService);
  }
}
