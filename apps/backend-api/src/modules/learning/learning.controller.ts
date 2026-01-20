/**
 * Learning Controller
 * Handles enrollment and progress tracking endpoints
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LearningService } from './learning.service';
import {
  EnrollmentResponseDto,
  EnrollmentListResponseDto,
  CompleteLessonDto,
  CompleteLessonResponseDto,
  CourseProgressResponseDto,
} from './learning.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Learning')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post('courses/:courseId/enroll')
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 201, type: EnrollmentResponseDto })
  @ApiResponse({ status: 400, description: 'Already enrolled' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async enrollInCourse(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<EnrollmentResponseDto> {
    return this.learningService.enrollInCourse(userId, courseId);
  }

  @Delete('courses/:courseId/enroll')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unenroll from a course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 204, description: 'Successfully unenrolled' })
  @ApiResponse({ status: 404, description: 'Not enrolled in this course' })
  async unenrollFromCourse(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    await this.learningService.unenrollFromCourse(userId, courseId);
  }

  @Get('me/enrollments')
  @ApiOperation({ summary: 'Get all my enrollments' })
  @ApiResponse({ status: 200, type: [EnrollmentResponseDto] })
  async getMyEnrollments(
    @CurrentUser('userId') userId: string,
  ): Promise<EnrollmentResponseDto[]> {
    return this.learningService.getUserEnrollments(userId);
  }

  @Get('me/enrollments/:courseId')
  @ApiOperation({ summary: 'Get enrollment for a specific course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, type: EnrollmentResponseDto })
  @ApiResponse({ status: 404, description: 'Not enrolled in this course' })
  async getEnrollment(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<EnrollmentResponseDto> {
    return this.learningService.getEnrollment(userId, courseId);
  }

  @Get('me/enrollments/:courseId/progress')
  @ApiOperation({ summary: 'Get course progress' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, type: CourseProgressResponseDto })
  @ApiResponse({ status: 404, description: 'Not enrolled in this course' })
  async getCourseProgress(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<CourseProgressResponseDto> {
    return this.learningService.getCourseProgress(userId, courseId);
  }

  @Post('lessons/:lessonId/complete')
  @ApiOperation({ summary: 'Complete a lesson and record score' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 200, type: CompleteLessonResponseDto })
  @ApiResponse({ status: 404, description: 'Lesson not found or not enrolled' })
  async completeLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: CompleteLessonDto,
    @CurrentUser('userId') userId: string,
  ): Promise<CompleteLessonResponseDto> {
    return this.learningService.completeLesson(userId, lessonId, dto.score);
  }
}
