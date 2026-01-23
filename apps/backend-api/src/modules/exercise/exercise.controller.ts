/**
 * Exercise Controller
 * Public endpoints for exercise and practice session operations
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ExerciseService } from './exercise.service';
import {
  GetExercisesQueryDto,
  StartSessionDto,
  SubmitAnswerDto,
  SubmitAttemptDto,
  ExerciseListResponseDto,
  ExerciseDetailResponseDto,
  SessionResponseDto,
  AttemptResponseDto,
  SubmitAnswerResponseDto,
  AttemptResultDto,
  CompleteSessionResponseDto,
} from './exercise.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// ============ EXERCISE ENDPOINTS ============

@ApiTags('Exercises')
@Controller('lessons/:lessonId/exercises')
export class LessonExercisesController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercises for a lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiQuery({ name: 'languageId', required: false, type: Number })
  @ApiResponse({ status: 200, type: ExerciseListResponseDto })
  async getExercisesByLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Query() query: GetExercisesQueryDto,
  ): Promise<ExerciseListResponseDto> {
    return this.exerciseService.getExercisesByLesson(lessonId, query);
  }
}

@ApiTags('Exercises')
@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise detail with items and options' })
  @ApiParam({ name: 'id', description: 'Exercise ID' })
  @ApiQuery({ name: 'languageId', required: false, type: Number })
  @ApiResponse({ status: 200, type: ExerciseDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async getExerciseDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('languageId') languageId?: number,
  ): Promise<ExerciseDetailResponseDto> {
    return this.exerciseService.getExerciseDetail(id, languageId);
  }
}

// ============ SESSION ENDPOINTS ============

@ApiTags('Practice Sessions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class SessionController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post('lessons/:lessonId/sessions')
  @ApiOperation({ summary: 'Start a new practice session for a lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 201, type: SessionResponseDto })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async startSession(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: StartSessionDto,
    @CurrentUser('userId') userId: string,
  ): Promise<SessionResponseDto> {
    return this.exerciseService.startSession(userId, lessonId, dto);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get session details' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<SessionResponseDto> {
    return this.exerciseService.getSession(sessionId);
  }

  @Post('sessions/:sessionId/attempts')
  @ApiOperation({ summary: 'Start a new attempt within a session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 201, type: AttemptResponseDto })
  @ApiResponse({ status: 400, description: 'Session already completed' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async startAttempt(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<AttemptResponseDto> {
    return this.exerciseService.startAttempt(userId, sessionId);
  }

  @Post('sessions/:sessionId/complete')
  @ApiOperation({ summary: 'Complete the session and get final results' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: CompleteSessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async completeSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<CompleteSessionResponseDto> {
    return this.exerciseService.completeSession(userId, sessionId);
  }
}

// ============ ATTEMPT ENDPOINTS ============

@ApiTags('Practice Sessions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('attempts')
export class AttemptController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post(':attemptId/submit-answer')
  @ApiOperation({ summary: 'Submit answer for a single exercise item' })
  @ApiParam({ name: 'attemptId', description: 'Attempt ID' })
  @ApiResponse({ status: 200, type: SubmitAnswerResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Already answered or invalid format',
  })
  @ApiResponse({ status: 404, description: 'Attempt or item not found' })
  async submitAnswer(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SubmitAnswerDto,
    @CurrentUser('userId') userId: string,
  ): Promise<SubmitAnswerResponseDto> {
    return this.exerciseService.submitAnswer(userId, attemptId, dto);
  }

  @Post(':attemptId/submit')
  @ApiOperation({ summary: 'Submit all answers and complete attempt' })
  @ApiParam({ name: 'attemptId', description: 'Attempt ID' })
  @ApiResponse({ status: 200, type: AttemptResultDto })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  async submitAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SubmitAttemptDto,
    @CurrentUser('userId') userId: string,
  ): Promise<AttemptResultDto> {
    return this.exerciseService.submitAttempt(userId, attemptId, dto);
  }
}
