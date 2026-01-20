/**
 * Unit Service
 * Business logic orchestration for unit operations
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUnitRepository } from '../../domain/ports/unit-repository.port';
import { ICourseVersionRepository } from '../../domain/ports/course-version-repository.port';
import { UnitEntity } from '../../domain/entities/unit.entity';
import { UNIT_REPOSITORY, UNIT_MESSAGES } from './unit.types';
import { COURSE_VERSION_REPOSITORY } from '../course/course.types';
import {
  CreateUnitDto,
  UpdateUnitDto,
  ReorderUnitsDto,
  AddUnitLocalizationDto,
  UnitResponseDto,
  UnitListResponseDto,
} from './unit.dto';

@Injectable()
export class UnitService {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
    @Inject(COURSE_VERSION_REPOSITORY)
    private readonly courseVersionRepository: ICourseVersionRepository,
  ) {}

  async createUnit(
    courseVersionId: string,
    dto: CreateUnitDto,
  ): Promise<UnitResponseDto> {
    // Verify course version exists
    const courseVersion =
      await this.courseVersionRepository.findById(courseVersionId);
    if (!courseVersion) {
      throw new NotFoundException(UNIT_MESSAGES.COURSE_VERSION_NOT_FOUND);
    }

    const orderIndex =
      await this.unitRepository.getNextOrderIndex(courseVersionId);

    const unit = await this.unitRepository.create({
      courseVersionId,
      orderIndex,
      localizations: dto.localizations?.map((l) => ({
        languageId: l.languageId,
        title: l.title,
        description: l.description,
      })),
    });

    return this.toResponseDto(unit, dto.localizations?.[0]?.languageId);
  }

  async getUnitById(
    unitId: string,
    languageId?: number,
  ): Promise<UnitResponseDto> {
    const unit = await this.unitRepository.findById(unitId, languageId);
    if (!unit) {
      throw new NotFoundException(UNIT_MESSAGES.NOT_FOUND);
    }
    return this.toResponseDto(unit, languageId);
  }

  async getUnitsByCourseVersion(
    courseVersionId: string,
    languageId?: number,
  ): Promise<UnitListResponseDto> {
    const [units, total] = await Promise.all([
      this.unitRepository.findByCourseVersionId(courseVersionId, languageId),
      this.unitRepository.countByCourseVersionId(courseVersionId),
    ]);

    return {
      data: units.map((u) => this.toResponseDto(u, languageId)),
      total,
    };
  }

  async updateUnit(
    unitId: string,
    dto: UpdateUnitDto,
  ): Promise<UnitResponseDto> {
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException(UNIT_MESSAGES.NOT_FOUND);
    }

    const updated = await this.unitRepository.update(unitId, {
      orderIndex: dto.orderIndex,
    });

    return this.toResponseDto(updated);
  }

  async deleteUnit(unitId: string): Promise<void> {
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException(UNIT_MESSAGES.NOT_FOUND);
    }
    await this.unitRepository.delete(unitId);
  }

  async reorderUnits(
    courseVersionId: string,
    dto: ReorderUnitsDto,
  ): Promise<void> {
    // Verify course version exists
    const courseVersion =
      await this.courseVersionRepository.findById(courseVersionId);
    if (!courseVersion) {
      throw new NotFoundException(UNIT_MESSAGES.COURSE_VERSION_NOT_FOUND);
    }

    await this.unitRepository.reorder(dto.unitIds);
  }

  async addLocalization(
    unitId: string,
    dto: AddUnitLocalizationDto,
  ): Promise<void> {
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException(UNIT_MESSAGES.NOT_FOUND);
    }

    await this.unitRepository.addLocalization(unitId, {
      languageId: dto.languageId,
      title: dto.title,
      description: dto.description,
    });
  }

  async updateLocalization(
    unitId: string,
    dto: AddUnitLocalizationDto,
  ): Promise<void> {
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException(UNIT_MESSAGES.NOT_FOUND);
    }

    await this.unitRepository.updateLocalization(unitId, {
      languageId: dto.languageId,
      title: dto.title,
      description: dto.description,
    });
  }

  async deleteLocalization(unitId: string, languageId: number): Promise<void> {
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException(UNIT_MESSAGES.NOT_FOUND);
    }

    await this.unitRepository.deleteLocalization(unitId, languageId);
  }

  private toResponseDto(
    unit: UnitEntity,
    languageId?: number,
  ): UnitResponseDto {
    const localization = languageId
      ? unit.localizations.find((l) => l.languageId === languageId)
      : unit.localizations[0];

    return {
      unitId: unit.unitId,
      courseVersionId: unit.courseVersionId,
      orderIndex: unit.orderIndex,
      localizations: unit.localizations.map((l) => ({
        languageId: l.languageId,
        title: l.title,
        description: l.description,
      })),
      title: localization?.title,
      description: localization?.description,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }
}
