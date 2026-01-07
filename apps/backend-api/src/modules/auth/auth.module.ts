/**
 * Auth Module
 * Wires all auth-related components together
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Domain Ports
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { IRefreshTokenRepository } from '../../domain/ports/refresh-token-repository.port';
import { ITokenService } from '../../domain/ports/token-service.port';
import { IHashService } from '../../domain/ports/hash-service.port';
import { IEmailService } from '../../domain/ports/email-service.port';

// Infrastructure Implementations
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { RefreshTokenRepository } from '../../infrastructure/database/repositories/refresh-token.repository';
import { JwtTokenService } from '../../infrastructure/auth/jwt-token.service';
import { BcryptHashService } from '../../infrastructure/auth/bcrypt-hash.service';
import { EmailService } from '../../infrastructure/email/email.service';

@Module({
  imports: [
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
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IRefreshTokenRepository,
      useClass: RefreshTokenRepository,
    },

    // Service implementations
    {
      provide: ITokenService,
      useClass: JwtTokenService,
    },
    {
      provide: IHashService,
      useClass: BcryptHashService,
    },
    {
      provide: IEmailService,
      useClass: EmailService,
    },
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
