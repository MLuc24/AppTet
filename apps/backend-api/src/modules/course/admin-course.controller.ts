/**
 * Admin Course Controller
 * Admin-only course management endpoints
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseResponseDto,
  CourseListResponseDto,
  AddLocalizationDto,
  PublishCourseResponseDto,
} from './course.dto';
// TODO: Import guards when available
// import { AuthGuard } from '../../common/guards/auth.guard';
// import { RoleGuard } from '../../common/guards/role.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin - Courses')
@ApiBearerAuth()
@Controller('admin/courses')
// @UseGuards(AuthGuard, RoleGuard)
// @Roles('admin', 'content_editor')
export class AdminCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'List all courses (admin)' })
  @ApiResponse({ status: 200, type: CourseListResponseDto })
  getCourses(
    @Query()
    query: CourseQueryDto,
  ): Promise<CourseListResponseDto> {
    return this.courseService.getCourses(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details (admin)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, type: CourseResponseDto })
  getCourseById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('languageId') languageId?: number,
  ): Promise<CourseResponseDto> {
    return this.courseService.getCourseById(id, languageId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, type: CourseResponseDto })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  createCourse(
    @Body() dto: CreateCourseDto,
    // @CurrentUser() user: { userId: string },
  ): Promise<CourseResponseDto> {
    return this.courseService.createCourse(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Course not found' })
  updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.courseService.updateCourse(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 204, description: 'Course deleted' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  deleteCourse(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.courseService.deleteCourse(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, type: PublishCourseResponseDto })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Course not publishable' })
  async publishCourse(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublishCourseResponseDto> {
    const result = await this.courseService.publishCourse(id);
    return {
      success: true,
      courseId: id,
      publishedAt: result.publishedAt,
    };
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 204, description: 'Course archived' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  archiveCourse(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.courseService.archiveCourse(id);
  }

  // Localization endpoints
  @Post(':id/localizations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add course localization' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 201, description: 'Localization added' })
  addLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddLocalizationDto,
  ): Promise<void> {
    return this.courseService.addLocalization(id, dto);
  }

  @Put(':id/localizations/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update course localization' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Localization updated' })
  updateLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('languageId') languageId: number,
    @Body() dto: AddLocalizationDto,
  ): Promise<void> {
    return this.courseService.updateLocalization(id, { ...dto, languageId });
  }

  @Delete(':id/localizations/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete course localization' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Localization deleted' })
  deleteLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('languageId') languageId: number,
  ): Promise<void> {
    return this.courseService.deleteLocalization(id, languageId);
  }
}
