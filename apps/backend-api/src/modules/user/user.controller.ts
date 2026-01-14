import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators';
import { Public } from '../../common/decorators/public.decorator';
import { UserService } from './user.service';
import { PublicUserProfileDto, UserProfileDto } from './user.dto';
import { MediaUploadResponseDto } from '../media/media.dto';

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

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (jpg, png, webp)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: MediaUploadResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ): Promise<MediaUploadResponseDto> {
    return this.userService.uploadAvatar(userId, file);
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
