/**
 * Admin Unit Controller
 * Unit management endpoints (nested under course versions)
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
import { UnitService } from './unit.service';
import {
  CreateUnitDto,
  UpdateUnitDto,
  ReorderUnitsDto,
  AddUnitLocalizationDto,
  UnitResponseDto,
  UnitListResponseDto,
} from './unit.dto';

@ApiTags('Admin - Units')
@ApiBearerAuth()
@Controller('admin/course-versions/:courseVersionId/units')
export class AdminUnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  @ApiOperation({ summary: 'List units for a course version' })
  @ApiParam({ name: 'courseVersionId', description: 'Course Version ID' })
  @ApiResponse({ status: 200, type: UnitListResponseDto })
  async getUnits(
    @Param('courseVersionId', ParseUUIDPipe) courseVersionId: string,
    @Query('languageId') languageId?: number,
  ): Promise<UnitListResponseDto> {
    return this.unitService.getUnitsByCourseVersion(
      courseVersionId,
      languageId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit details' })
  @ApiParam({ name: 'courseVersionId', description: 'Course Version ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, type: UnitResponseDto })
  async getUnitById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('languageId') languageId?: number,
  ): Promise<UnitResponseDto> {
    return this.unitService.getUnitById(id, languageId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiParam({ name: 'courseVersionId', description: 'Course Version ID' })
  @ApiResponse({ status: 201, type: UnitResponseDto })
  async createUnit(
    @Param('courseVersionId', ParseUUIDPipe) courseVersionId: string,
    @Body() dto: CreateUnitDto,
  ): Promise<UnitResponseDto> {
    return this.unitService.createUnit(courseVersionId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiParam({ name: 'courseVersionId', description: 'Course Version ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, type: UnitResponseDto })
  async updateUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitDto,
  ): Promise<UnitResponseDto> {
    return this.unitService.updateUnit(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiParam({ name: 'courseVersionId', description: 'Course Version ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 204, description: 'Unit deleted' })
  async deleteUnit(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.unitService.deleteUnit(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder units' })
  @ApiParam({ name: 'courseVersionId', description: 'Course Version ID' })
  @ApiResponse({ status: 204, description: 'Units reordered' })
  async reorderUnits(
    @Param('courseVersionId', ParseUUIDPipe) courseVersionId: string,
    @Body() dto: ReorderUnitsDto,
  ): Promise<void> {
    return this.unitService.reorderUnits(courseVersionId, dto);
  }

  // Localization endpoints
  @Post(':id/localizations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add unit localization' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 201, description: 'Localization added' })
  async addLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddUnitLocalizationDto,
  ): Promise<void> {
    return this.unitService.addLocalization(id, dto);
  }

  @Put(':id/localizations/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update unit localization' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Localization updated' })
  async updateLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('languageId') languageId: number,
    @Body() dto: AddUnitLocalizationDto,
  ): Promise<void> {
    return this.unitService.updateLocalization(id, { ...dto, languageId });
  }

  @Delete(':id/localizations/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete unit localization' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Localization deleted' })
  async deleteLocalization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('languageId') languageId: number,
  ): Promise<void> {
    return this.unitService.deleteLocalization(id, languageId);
  }
}
