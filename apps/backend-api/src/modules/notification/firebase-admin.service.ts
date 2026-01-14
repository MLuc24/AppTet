/**
 * Firebase Admin Service
 * Initializes Firebase Admin SDK and sends push notifications
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';

interface FirebaseMessagePayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: admin.app.App | null = null;
  private isEnabled = false;

  constructor(private readonly configService: ConfigService) {
    this.app = this.initFirebaseApp();
  }

  async sendToTokens(
    tokens: string[],
    payload: FirebaseMessagePayload,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.isEnabled || !this.app) {
      this.logger.warn('Firebase is not configured. Skipping push notification.');
      return { successCount: 0, failureCount: 0 };
    }

    if (!tokens.length) {
      return { successCount: 0, failureCount: 0 };
    }

    const response = await this.app.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  }

  private initFirebaseApp(): admin.app.App | null {
    if (admin.apps.length > 0) {
      this.isEnabled = true;
      return admin.app();
    }

    try {
      const serviceAccount = this.loadServiceAccount();
      
      if (!serviceAccount) {
        this.logger.warn('Firebase credentials not configured. Push notifications will be disabled.');
        return null;
      }

      this.logger.log('Initializing Firebase Admin SDK');
      this.isEnabled = true;

      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      this.logger.warn('Failed to initialize Firebase. Push notifications will be disabled.');
      this.logger.warn(error.message);
      return null;
    }
  }

  private loadServiceAccount(): admin.ServiceAccount | null {
    const jsonRaw = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    );
    const path = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_PATH',
    );

    if (jsonRaw) {
      try {
        return JSON.parse(jsonRaw) as admin.ServiceAccount;
      } catch (error) {
        this.logger.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON');
        return null;
      }
    }

    if (path) {
      try {
        const file = readFileSync(path, 'utf8');
        return JSON.parse(file) as admin.ServiceAccount;
      } catch (error) {
        this.logger.error(`Failed to read Firebase service account from ${path}`);
        return null;
      }
    }

    return null;
  }
}
