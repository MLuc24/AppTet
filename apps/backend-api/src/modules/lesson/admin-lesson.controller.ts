/**
 * Admin Lesson Controller
 * Lesson management endpoints (nested under skills)
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
import { LessonService } from './lesson.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  ReorderLessonsDto,
  AddLessonLocalizationDto,
  LessonResponseDto,
  LessonListResponseDto,
} from './lesson.dto';

@ApiTags('Admin - Lessons')
@ApiBearerAuth()
@Controller('admin/skills/:skillId/lessons')
export class AdminLessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @ApiOperation({ summary: 'List lessons for a skill' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 200, type: LessonListResponseDto })
  getLessons(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Query('languageId') languageId?: number,
  ): Promise<LessonListResponseDto> {
    return this.lessonService.getLessonsBySkill(skillId, languageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson details' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, type: LessonResponseDto })
  getLessonById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('languageId') languageId?: number,
  ): Promise<LessonResponseDto> {
    return this.lessonService.getLessonById(id, languageId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 201, type: LessonResponseDto })
  createLesson(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() dto: CreateLessonDto,
  ): Promise<LessonResponseDto> {
    return this.lessonService.createLesson(skillId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, type: LessonResponseDto })
  updateLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    return this.lessonService.updateLesson(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 204, description: 'Lesson deleted' })
  deleteLesson(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.lessonService.deleteLesson(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder lessons' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 204, description: 'Lessons reordered' })
  reorderLessons(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() dto: ReorderLessonsDto,
  ): Promise<void> {
    return this.lessonService.reorderLessons(skillId, dto);
  }

  // Localization endpoints
  @Post(':id/localizations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add lesson localization' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 201, description: 'Localization added' })
  addLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddLessonLocalizationDto,
  ): Promise<void> {
    return this.lessonService.addLocalization(id, dto);
  }

  @Put(':id/localizations/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update lesson localization' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Localization updated' })
  updateLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('languageId') languageId: number,
    @Body() dto: AddLessonLocalizationDto,
  ): Promise<void> {
    return this.lessonService.updateLocalization(id, { ...dto, languageId });
  }

  @Delete(':id/localizations/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lesson localization' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Localization deleted' })
  deleteLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('languageId') languageId: number,
  ): Promise<void> {
    return this.lessonService.deleteLocalization(id, languageId);
  }
}
