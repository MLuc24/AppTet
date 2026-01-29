/**
 * Auth Module
 * Wires all auth-related components together
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaClient } from '.prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  USER_REPOSITORY,
  ROLE_REPOSITORY,
  SESSION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  DEVICE_REPOSITORY,
  TOKEN_SERVICE,
  HASH_SERVICE,
  EMAIL_SERVICE,
} from './auth.constants';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { MediaModule } from '../media/media.module';

// Infrastructure Implementations
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { RoleRepository } from '../../infrastructure/database/repositories/role.repository';
import { SessionRepository } from '../../infrastructure/database/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/database/repositories/refresh-token.repository';
import { DeviceRepository } from '../../infrastructure/database/repositories/device.repository';
import { JwtTokenService } from '../../infrastructure/auth/jwt-token.service';
import { BcryptHashService } from '../../infrastructure/auth/bcrypt-hash.service';

@Module({
  imports: [
    EmailModule,
    MediaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService): any => {
        const secret = configService.get<string>(
          'JWT_SECRET',
          'your-super-secret-key-change-in-production',
        );
        const expiresIn = configService.get<string>(
          'JWT_ACCESS_EXPIRATION',
          '15m',
        );
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,

    // Prisma
    PrismaClient,

    // Repository implementations
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: SessionRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenRepository,
    },
    {
      provide: DEVICE_REPOSITORY,
      useClass: DeviceRepository,
    },

    // Service implementations
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: HASH_SERVICE,
      useClass: BcryptHashService,
    },
    {
      provide: EMAIL_SERVICE,
      useExisting: EmailService,
    },
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
