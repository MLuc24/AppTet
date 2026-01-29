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
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
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
  ProgressTodayQueryDto,
  ProgressWeeklyQueryDto,
  ReviewQueueQueryDto,
  ProgressTodayResponseDto,
  ProgressWeeklyResponseDto,
  ReviewSummaryResponseDto,
  ReviewQueueResponseDto,
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

  @Get('progress/today')
  @ApiOperation({ summary: "Get today's progress" })
  @ApiResponse({ status: 200, type: ProgressTodayResponseDto })
  async getTodayProgress(
    @CurrentUser('userId') userId: string,
    @Query() query: ProgressTodayQueryDto,
    @Headers('x-timezone') timeZoneHeader?: string,
  ): Promise<ProgressTodayResponseDto> {
    return this.learningService.getProgressToday(
      userId,
      query.date,
      timeZoneHeader,
    );
  }

  @Get('progress/weekly')
  @ApiOperation({ summary: 'Get weekly progress' })
  @ApiResponse({ status: 200, type: ProgressWeeklyResponseDto })
  async getWeeklyProgress(
    @CurrentUser('userId') userId: string,
    @Query() query: ProgressWeeklyQueryDto,
    @Headers('x-timezone') timeZoneHeader?: string,
  ): Promise<ProgressWeeklyResponseDto> {
    return this.learningService.getProgressWeekly(
      userId,
      query.weekStart,
      timeZoneHeader,
    );
  }

  @Get('review/summary')
  @ApiOperation({ summary: 'Get review queue summary' })
  @ApiResponse({ status: 200, type: ReviewSummaryResponseDto })
  async getReviewSummary(
    @CurrentUser('userId') userId: string,
    @Headers('x-timezone') timeZoneHeader?: string,
  ): Promise<ReviewSummaryResponseDto> {
    return this.learningService.getReviewSummary(userId, timeZoneHeader);
  }

  @Get('review/queue')
  @ApiOperation({ summary: 'Get review queue items' })
  @ApiResponse({ status: 200, type: ReviewQueueResponseDto })
  async getReviewQueue(
    @CurrentUser('userId') userId: string,
    @Query() query: ReviewQueueQueryDto,
  ): Promise<ReviewQueueResponseDto> {
    return this.learningService.getReviewQueue(userId, query);
  }

  @Post('lessons/:lessonId/practice/start')
  @ApiOperation({ summary: 'Start a practice session for a lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 201, description: 'Practice session started' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async startPracticeSession(
    @Param('lessonId') lessonId: string,
    @Body() dto: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return this.learningService.startPracticeSession(userId, lessonId, dto.mode || 'learn');
  }

  @Put('practice-sessions/:sessionId/end')
  @ApiOperation({ summary: 'End a practice session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Practice session ended' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async endPracticeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return this.learningService.endPracticeSession(userId, sessionId);
  }

  @Post('review/submit')
  @ApiOperation({ summary: 'Submit a review answer' })
  @ApiResponse({ status: 200, description: 'Review submitted successfully' })
  @ApiResponse({ status: 404, description: 'Review item not found' })
  async submitReview(
    @Body() dto: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return this.learningService.submitReview(userId, dto.itemId, dto.isCorrect, dto.userAnswer);
  }
}
