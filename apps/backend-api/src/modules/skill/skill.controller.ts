/**
 * Admin Skill Controller
 * Skill management endpoints (nested under units)
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
import { SkillService } from './skill.service';
import {
  CreateSkillDto,
  UpdateSkillDto,
  ReorderSkillsDto,
  AddSkillLocalizationDto,
  SkillResponseDto,
  SkillListResponseDto,
} from './skill.dto';

@ApiTags('Admin - Skills')
@ApiBearerAuth()
@Controller('admin/units/:unitId/skills')
export class AdminSkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  @ApiOperation({ summary: 'List skills for a unit' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @ApiResponse({ status: 200, type: SkillListResponseDto })
  async getSkills(
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Query('languageId') languageId?: number,
  ): Promise<SkillListResponseDto> {
    return this.skillService.getSkillsByUnit(unitId, languageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get skill details' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, type: SkillResponseDto })
  async getSkillById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('languageId') languageId?: number,
  ): Promise<SkillResponseDto> {
    return this.skillService.getSkillById(id, languageId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @ApiResponse({ status: 201, type: SkillResponseDto })
  async createSkill(
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Body() dto: CreateSkillDto,
  ): Promise<SkillResponseDto> {
    return this.skillService.createSkill(unitId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a skill' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, type: SkillResponseDto })
  async updateSkill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillDto,
  ): Promise<SkillResponseDto> {
    return this.skillService.updateSkill(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a skill' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 204, description: 'Skill deleted' })
  async deleteSkill(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.skillService.deleteSkill(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder skills' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @ApiResponse({ status: 204, description: 'Skills reordered' })
  async reorderSkills(
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Body() dto: ReorderSkillsDto,
  ): Promise<void> {
    return this.skillService.reorderSkills(unitId, dto);
  }

  // Localization endpoints
  @Post(':id/localizations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add skill localization' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 201, description: 'Localization added' })
  async addLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddSkillLocalizationDto,
  ): Promise<void> {
    return this.skillService.addLocalization(id, dto);
  }

  @Put(':id/localizations/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update skill localization' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Localization updated' })
  async updateLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('languageId') languageId: number,
    @Body() dto: AddSkillLocalizationDto,
  ): Promise<void> {
    return this.skillService.updateLocalization(id, { ...dto, languageId });
  }

  @Delete(':id/localizations/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete skill localization' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Localization deleted' })
  async deleteLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('languageId') languageId: number,
  ): Promise<void> {
    return this.skillService.deleteLocalization(id, languageId);
  }
}
