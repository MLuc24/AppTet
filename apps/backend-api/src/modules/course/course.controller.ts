/**
 * Course Controller - Public Endpoints
 * Handles public course listing and details
 */

import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CourseService } from './course.service';
import {
  CourseQueryDto,
  CourseResponseDto,
  CourseListResponseDto,
} from './course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'List published courses' })
  @ApiResponse({ status: 200, type: CourseListResponseDto })
  async getCourses(
    @Query() query: CourseQueryDto,
  ): Promise<CourseListResponseDto> {
    // Public endpoint - only show published courses
    return this.courseService.getCourses({
      ...query,
      isPublished: true,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('languageId') languageId?: number,
  ): Promise<CourseResponseDto> {
    return this.courseService.getCourseById(id, languageId);
  }
}
