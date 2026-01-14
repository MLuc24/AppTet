import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { UserService } from './user.service';
import { UpdateUserSettingsDto, UserSettingsDto } from './user.dto';

@ApiTags('User Settings')
@ApiBearerAuth()
@Controller('users/settings')
export class UserSettingsController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiResponse({ status: 200, type: UserSettingsDto })
  async getSettings(
    @CurrentUser('userId') userId: string,
  ): Promise<UserSettingsDto> {
    return this.userService.getSettings(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user settings' })
  @ApiResponse({ status: 200, type: UserSettingsDto })
  async updateSettings(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateUserSettingsDto,
  ): Promise<UserSettingsDto> {
    return this.userService.updateSettings(userId, dto);
  }
}
