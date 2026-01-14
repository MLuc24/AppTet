import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleGuard } from '../../common/guards/role.guard';
import { UserService } from './user.service';
import {
  AdminListUsersQueryDto,
  AdminSetUserRolesDto,
  AdminUpdateUserDto,
  AdminUserDto,
  AdminUserListResponseDto,
  AdminUserRolesResponseDto,
} from './user.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(RoleGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List users (admin)' })
  @ApiResponse({ status: 200, type: AdminUserListResponseDto })
  async listUsers(
    @Query() query: AdminListUsersQueryDto,
  ): Promise<AdminUserListResponseDto> {
    return this.userService.listUsers(query);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user by id (admin)' })
  @ApiResponse({ status: 200, type: AdminUserDto })
  async getUser(@Param('userId') userId: string): Promise<AdminUserDto> {
    return this.userService.getUserById(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update user (admin)' })
  @ApiResponse({ status: 200, type: AdminUserDto })
  async updateUser(
    @Param('userId') userId: string,
    @Body() dto: AdminUpdateUserDto,
  ): Promise<AdminUserDto> {
    return this.userService.updateUser(userId, dto);
  }

  @Put(':userId/roles')
  @ApiOperation({ summary: 'Replace user roles (admin)' })
  @ApiResponse({ status: 200, type: AdminUserRolesResponseDto })
  async setRoles(
    @Param('userId') userId: string,
    @Body() dto: AdminSetUserRolesDto,
  ): Promise<AdminUserRolesResponseDto> {
    return this.userService.setUserRoles(userId, dto);
  }
}
