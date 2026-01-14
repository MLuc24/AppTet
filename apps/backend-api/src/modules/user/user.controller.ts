import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { Public } from '../../common/decorators/public.decorator';
import { UserService } from './user.service';
import { PublicUserProfileDto, UserProfileDto } from './user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async getMe(@CurrentUser('userId') userId: string): Promise<UserProfileDto> {
    return this.userService.getProfile(userId);
  }

  @Public()
  @Get(':userId/public')
  @ApiOperation({ summary: 'Get public user profile' })
  @ApiResponse({ status: 200, type: PublicUserProfileDto })
  async getPublicProfile(
    @Param('userId') userId: string,
  ): Promise<PublicUserProfileDto> {
    return this.userService.getPublicProfile(userId);
  }
}
