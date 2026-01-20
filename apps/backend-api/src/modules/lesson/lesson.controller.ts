/**
 * Lesson Controller - Public Endpoints
 * Handles lesson access for enrolled users
 */

import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { LessonResponseDto, LessonListResponseDto } from './lesson.dto';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson details' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, type: LessonResponseDto })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getLessonById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('languageId') languageId?: number,
  ): Promise<LessonResponseDto> {
    return this.lessonService.getLessonById(id, languageId);
  }
}

@ApiTags('Lessons')
@Controller('skills/:skillId/lessons')
export class SkillLessonsController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @ApiOperation({ summary: 'List lessons for a skill' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 200, type: LessonListResponseDto })
  async getLessonsBySkill(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Query('languageId') languageId?: number,
  ): Promise<LessonListResponseDto> {
    return this.lessonService.getLessonsBySkill(skillId, languageId);
  }
}
