import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { RoleRepository } from '../../infrastructure/database/repositories/role.repository';
import { UserEntity, UserStatus } from '../../domain/entities/user.entity';
import {
  AdminListUsersQueryDto,
  AdminSetUserRolesDto,
  AdminUpdateUserDto,
  UpdateUserSettingsDto,
  UserProfileDto,
  UserSettingsDto,
  PublicUserProfileDto,
  AdminUserDto,
  AdminUserListResponseDto,
  AdminUserRolesResponseDto,
} from './user.dto';
import { MediaService } from '../media/media.service';
import { MediaCategory, MediaUploadResponseDto } from '../media/media.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly mediaService: MediaService,
  ) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserProfile(user);
  }

  async getSettings(userId: string): Promise<UserSettingsDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserSettings(user);
  }

  async updateSettings(
    userId: string,
    dto: UpdateUserSettingsDto,
  ): Promise<UserSettingsDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.update(userId, {
      displayName: dto.displayName,
      avatarAssetId: dto.avatarAssetId,
      dob: dto.dob ? new Date(dto.dob) : undefined,
      nativeLanguageId: dto.nativeLanguageId,
      timezone: dto.timezone,
    });

    return this.mapUserSettings(updated);
  }

  async getPublicProfile(userId: string): Promise<PublicUserProfileDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapPublicProfile(user);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<MediaUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Upload avatar using MediaService
    const uploadResult = await this.mediaService.uploadFile(
      file,
      MediaCategory.AVATAR,
      userId,
      'avatar.jpg', // Will be sanitized in MediaService
    );

    // Update user's avatarAssetId in database
    await this.userRepository.update(userId, {
      avatarAssetId: uploadResult.assetId,
    });

    return uploadResult;
  }

  async listUsers(
    query: AdminListUsersQueryDto,
  ): Promise<AdminUserListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      this.userRepository.countByFilter({
        search: query.search,
        status: query.status,
        roleCode: query.role,
      }),
      this.userRepository.findMany({
        skip,
        take: limit,
        search: query.search,
        status: query.status,
        roleCode: query.role,
      }),
    ]);

    const items = await Promise.all(
      users.map(async (user) => {
        const roles = await this.roleRepository.getUserRoles(user.userId);
        return this.mapAdminUser(
          user,
          roles.map((role) => role.code),
        );
      }),
    );

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getUserById(userId: string): Promise<AdminUserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.roleRepository.getUserRoles(userId);
    return this.mapAdminUser(
      user,
      roles.map((role) => role.code),
    );
  }

  async updateUser(
    userId: string,
    dto: AdminUpdateUserDto,
  ): Promise<AdminUserDto> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(dto.email);
      if (emailExists) {
        throw new ConflictException('Email is already in use');
      }
    }

    if (dto.phone && dto.phone !== existingUser.phone) {
      const phoneExists = await this.userRepository.findByPhone(dto.phone);
      if (phoneExists) {
        throw new ConflictException('Phone is already in use');
      }
    }

    const updated = await this.userRepository.update(userId, {
      email: dto.email,
      phone: dto.phone,
      displayName: dto.displayName,
      avatarAssetId: dto.avatarAssetId,
      status: dto.status,
      emailVerified: dto.emailVerified,
      dob: dto.dob ? new Date(dto.dob) : undefined,
      nativeLanguageId: dto.nativeLanguageId,
      timezone: dto.timezone,
    });

    const roles = await this.roleRepository.getUserRoles(userId);
    return this.mapAdminUser(
      updated,
      roles.map((role) => role.code),
    );
  }

  async setUserRoles(
    userId: string,
    dto: AdminSetUserRolesDto,
  ): Promise<AdminUserRolesResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleCodes = Array.from(
      new Set(dto.roles.map((role) => role.trim()).filter(Boolean)),
    );

    if (roleCodes.length === 0) {
      throw new BadRequestException('Roles list cannot be empty');
    }

    const roleEntities = await Promise.all(
      roleCodes.map((code) => this.roleRepository.findByCode(code)),
    );

    const missingRoles = roleEntities
      .map((role, index) => (role ? null : roleCodes[index]))
      .filter((code): code is string => Boolean(code));

    if (missingRoles.length > 0) {
      throw new BadRequestException(
        `Invalid roles: ${missingRoles.join(', ')}`,
      );
    }

    const existingRoles = await this.roleRepository.getUserRoles(userId);
    const existingCodes = new Set(existingRoles.map((role) => role.code));
    const desiredCodes = new Set(roleCodes);

    await Promise.all(
      existingRoles
        .filter((role) => !desiredCodes.has(role.code))
        .map((role) =>
          this.roleRepository.removeRoleFromUser(userId, role.roleId),
        ),
    );

    await Promise.all(
      roleEntities
        .filter(
          (role): role is NonNullable<typeof role> =>
            !!role && !existingCodes.has(role.code),
        )
        .map((role) =>
          this.roleRepository.assignRoleToUser(userId, role.roleId),
        ),
    );

    return {
      userId,
      roles: roleCodes,
    };
  }

  private mapUserProfile(user: UserEntity): UserProfileDto {
    return {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      avatarAssetId: user.avatarAssetId,
      status: user.status as UserStatus,
      emailVerified: user.emailVerified,
      dob: user.dob,
      nativeLanguageId: user.nativeLanguageId,
      timezone: user.timezone,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapAdminUser(user: UserEntity, roles: string[]): AdminUserDto {
    return {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      avatarAssetId: user.avatarAssetId,
      status: user.status as UserStatus,
      emailVerified: user.emailVerified,
      dob: user.dob,
      nativeLanguageId: user.nativeLanguageId,
      timezone: user.timezone,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles,
    };
  }

  private mapUserSettings(user: UserEntity): UserSettingsDto {
    return {
      userId: user.userId,
      displayName: user.displayName,
      avatarAssetId: user.avatarAssetId,
      dob: user.dob,
      nativeLanguageId: user.nativeLanguageId,
      timezone: user.timezone,
      updatedAt: user.updatedAt,
    };
  }

  private mapPublicProfile(user: UserEntity): PublicUserProfileDto {
    return {
      userId: user.userId,
      displayName: user.displayName,
      avatarAssetId: user.avatarAssetId,
      status: user.status as UserStatus,
      createdAt: user.createdAt,
    };
  }
}
