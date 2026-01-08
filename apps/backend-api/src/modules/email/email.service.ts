import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService as SmtpEmailService } from '../../infrastructure/email/email.service';

/**
 * Email module service wrapper
 * Reuses the SMTP implementation from the infrastructure layer.
 */
@Injectable()
export class EmailService extends SmtpEmailService {
  constructor(configService: ConfigService) {
    super(configService);
  }
}
