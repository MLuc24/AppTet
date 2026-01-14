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
  private app: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    this.app = this.initFirebaseApp();
  }

  async sendToTokens(
    tokens: string[],
    payload: FirebaseMessagePayload,
  ): Promise<{ successCount: number; failureCount: number }> {
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

  private initFirebaseApp(): admin.app.App {
    if (admin.apps.length > 0) {
      return admin.app();
    }

    const serviceAccount = this.loadServiceAccount();

    this.logger.log('Initializing Firebase Admin SDK');

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  private loadServiceAccount(): admin.ServiceAccount {
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
        throw error;
      }
    }

    if (path) {
      const file = readFileSync(path, 'utf8');
      return JSON.parse(file) as admin.ServiceAccount;
    }

    throw new Error(
      'Missing Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.',
    );
  }
}
