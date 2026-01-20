/**
 * Skill Service
 * Business logic orchestration for skill operations
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ISkillRepository } from '../../domain/ports/skill-repository.port';
import { IUnitRepository } from '../../domain/ports/unit-repository.port';
import { SkillEntity } from '../../domain/entities/skill.entity';
import { SKILL_REPOSITORY, SKILL_MESSAGES } from './skill.types';
import { UNIT_REPOSITORY } from '../unit/unit.types';
import {
  CreateSkillDto,
  UpdateSkillDto,
  ReorderSkillsDto,
  AddSkillLocalizationDto,
  SkillResponseDto,
  SkillListResponseDto,
} from './skill.dto';

@Injectable()
export class SkillService {
  constructor(
    @Inject(SKILL_REPOSITORY)
    private readonly skillRepository: ISkillRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async createSkill(
    unitId: string,
    dto: CreateSkillDto,
  ): Promise<SkillResponseDto> {
    // Verify unit exists
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException(SKILL_MESSAGES.UNIT_NOT_FOUND);
    }

    const orderIndex = await this.skillRepository.getNextOrderIndex(unitId);

    const skill = await this.skillRepository.create({
      unitId,
      skillType: dto.skillType,
      orderIndex,
      localizations: dto.localizations?.map((l) => ({
        languageId: l.languageId,
        title: l.title,
        description: l.description,
      })),
    });

    return this.toResponseDto(skill, dto.localizations?.[0]?.languageId);
  }

  async getSkillById(
    skillId: string,
    languageId?: number,
  ): Promise<SkillResponseDto> {
    const skill = await this.skillRepository.findById(skillId, languageId);
    if (!skill) {
      throw new NotFoundException(SKILL_MESSAGES.NOT_FOUND);
    }
    return this.toResponseDto(skill, languageId);
  }

  async getSkillsByUnit(
    unitId: string,
    languageId?: number,
  ): Promise<SkillListResponseDto> {
    const [skills, total] = await Promise.all([
      this.skillRepository.findByUnitId(unitId, languageId),
      this.skillRepository.countByUnitId(unitId),
    ]);

    return {
      data: skills.map((s) => this.toResponseDto(s, languageId)),
      total,
    };
  }

  async updateSkill(
    skillId: string,
    dto: UpdateSkillDto,
  ): Promise<SkillResponseDto> {
    const skill = await this.skillRepository.findById(skillId);
    if (!skill) {
      throw new NotFoundException(SKILL_MESSAGES.NOT_FOUND);
    }

    const updated = await this.skillRepository.update(skillId, {
      skillType: dto.skillType,
      orderIndex: dto.orderIndex,
    });

    return this.toResponseDto(updated);
  }

  async deleteSkill(skillId: string): Promise<void> {
    const skill = await this.skillRepository.findById(skillId);
    if (!skill) {
      throw new NotFoundException(SKILL_MESSAGES.NOT_FOUND);
    }
    await this.skillRepository.delete(skillId);
  }

  async reorderSkills(unitId: string, dto: ReorderSkillsDto): Promise<void> {
    // Verify unit exists
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException(SKILL_MESSAGES.UNIT_NOT_FOUND);
    }

    await this.skillRepository.reorder(dto.skillIds);
  }

  async addLocalization(
    skillId: string,
    dto: AddSkillLocalizationDto,
  ): Promise<void> {
    const skill = await this.skillRepository.findById(skillId);
    if (!skill) {
      throw new NotFoundException(SKILL_MESSAGES.NOT_FOUND);
    }

    await this.skillRepository.addLocalization(skillId, {
      languageId: dto.languageId,
      title: dto.title,
      description: dto.description,
    });
  }

  async updateLocalization(
    skillId: string,
    dto: AddSkillLocalizationDto,
  ): Promise<void> {
    const skill = await this.skillRepository.findById(skillId);
    if (!skill) {
      throw new NotFoundException(SKILL_MESSAGES.NOT_FOUND);
    }

    await this.skillRepository.updateLocalization(skillId, {
      languageId: dto.languageId,
      title: dto.title,
      description: dto.description,
    });
  }

  async deleteLocalization(skillId: string, languageId: number): Promise<void> {
    const skill = await this.skillRepository.findById(skillId);
    if (!skill) {
      throw new NotFoundException(SKILL_MESSAGES.NOT_FOUND);
    }

    await this.skillRepository.deleteLocalization(skillId, languageId);
  }

  private toResponseDto(
    skill: SkillEntity,
    languageId?: number,
  ): SkillResponseDto {
    const localization = languageId
      ? skill.localizations.find((l) => l.languageId === languageId)
      : skill.localizations[0];

    return {
      skillId: skill.skillId,
      unitId: skill.unitId,
      skillType: skill.skillType,
      orderIndex: skill.orderIndex,
      localizations: skill.localizations.map((l) => ({
        languageId: l.languageId,
        title: l.title,
        description: l.description,
      })),
      title: localization?.title,
      description: localization?.description,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    };
  }
}
