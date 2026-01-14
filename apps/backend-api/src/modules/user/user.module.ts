import { Module } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AdminUserController } from './admin-user.controller';
import { UserSettingsController } from './user-settings.controller';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { RoleRepository } from '../../infrastructure/database/repositories/role.repository';

@Module({
  controllers: [UserController, UserSettingsController, AdminUserController],
  providers: [UserService, PrismaClient, UserRepository, RoleRepository],
})
export class UserModule {}
