import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import {
  UploadMediaDto,
  MediaUploadResponseDto,
  MediaCategory,
} from './media.dto';
import { CurrentUser } from '../../common/decorators';

/**
 * Media Controller
 * Presentation layer - Handles media upload requests
 */
@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload media file (image, audio, video)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        category: {
          type: 'string',
          enum: Object.values(MediaCategory),
          default: MediaCategory.AVATAR,
          description: 'Media category',
        },
        filename: {
          type: 'string',
          description: 'Custom filename (optional)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: MediaUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or parameters' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser('userId') userId: string,
  ): Promise<MediaUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const category = dto.category || MediaCategory.AVATAR;

    return this.mediaService.uploadFile(
      file,
      category,
      userId,
      dto.filename,
    );
  }
}
