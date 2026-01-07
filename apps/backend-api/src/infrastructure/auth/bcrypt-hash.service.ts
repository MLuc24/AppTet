/**
 * Bcrypt Hash Service Implementation
 * Infrastructure layer - implements IHashService port
 */

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IHashService } from '../../domain/ports/hash-service.port';

@Injectable()
export class BcryptHashService implements IHashService {
  private readonly saltRounds = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  generateToken(): string {
    return crypto.randomUUID();
  }
}
