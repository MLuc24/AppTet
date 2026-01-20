/**
 * Skill Repository Implementation with Prisma
 * Infrastructure layer - implements ISkillRepository port
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, skills as PrismaSkill } from '@prisma/client';
import {
  ISkillRepository,
  CreateSkillData,
  UpdateSkillData,
} from '../../../domain/ports/skill-repository.port';
import {
  SkillEntity,
  SkillType,
  SkillLocalization,
} from '../../../domain/entities/skill.entity';

@Injectable()
export class SkillRepository implements ISkillRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(
    skillId: string,
    languageId?: number,
  ): Promise<SkillEntity | null> {
    const skill = await this.prisma.skills.findUnique({
      where: { skill_id: skillId },
      include: { skill_localizations: true },
    });
    return skill ? this.toDomain(skill, languageId) : null;
  }

  async findByUnitId(
    unitId: string,
    languageId?: number,
  ): Promise<SkillEntity[]> {
    const skills = await this.prisma.skills.findMany({
      where: { unit_id: unitId },
      include: { skill_localizations: true },
      orderBy: { order_index: 'asc' },
    });
    return skills.map((s) => this.toDomain(s, languageId));
  }

  async countByUnitId(unitId: string): Promise<number> {
    return this.prisma.skills.count({ where: { unit_id: unitId } });
  }

  async create(data: CreateSkillData): Promise<SkillEntity> {
    const skill = await this.prisma.skills.create({
      data: {
        unit_id: data.unitId,
        skill_type: data.skillType,
        order_index: data.orderIndex,
        skill_localizations: data.localizations?.length
          ? {
              create: data.localizations.map((l) => ({
                language_id: l.languageId,
                title: l.title,
                description: l.description,
              })),
            }
          : undefined,
      },
      include: { skill_localizations: true },
    });
    return this.toDomain(skill);
  }

  async update(skillId: string, data: UpdateSkillData): Promise<SkillEntity> {
    const updateData: Record<string, unknown> = {};
    if (data.skillType !== undefined) updateData.skill_type = data.skillType;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

    const skill = await this.prisma.skills.update({
      where: { skill_id: skillId },
      data: updateData,
      include: { skill_localizations: true },
    });
    return this.toDomain(skill);
  }

  async delete(skillId: string): Promise<void> {
    await this.prisma.skills.delete({ where: { skill_id: skillId } });
  }

  async reorder(skillIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      skillIds.map((id, index) =>
        this.prisma.skills.update({
          where: { skill_id: id },
          data: { order_index: index },
        }),
      ),
    );
  }

  async addLocalization(
    skillId: string,
    localization: SkillLocalization,
  ): Promise<void> {
    await this.prisma.skill_localizations.create({
      data: {
        skill_id: skillId,
        language_id: localization.languageId,
        title: localization.title,
        description: localization.description,
      },
    });
  }

  async updateLocalization(
    skillId: string,
    localization: SkillLocalization,
  ): Promise<void> {
    await this.prisma.skill_localizations.update({
      where: {
        skill_id_language_id: {
          skill_id: skillId,
          language_id: localization.languageId,
        },
      },
      data: {
        title: localization.title,
        description: localization.description,
      },
    });
  }

  async deleteLocalization(skillId: string, languageId: number): Promise<void> {
    await this.prisma.skill_localizations.delete({
      where: {
        skill_id_language_id: { skill_id: skillId, language_id: languageId },
      },
    });
  }

  async getNextOrderIndex(unitId: string): Promise<number> {
    const max = await this.prisma.skills.aggregate({
      where: { unit_id: unitId },
      _max: { order_index: true },
    });
    return (max._max.order_index ?? -1) + 1;
  }

  private toDomain(
    prisma: PrismaSkill & {
      skill_localizations?: Array<{
        language_id: number;
        title: string;
        description: string | null;
      }>;
    },
    _languageId?: number,
  ): SkillEntity {
    const localizations: SkillLocalization[] =
      prisma.skill_localizations?.map((l) => ({
        languageId: l.language_id,
        title: l.title,
        description: l.description ?? undefined,
      })) || [];

    return new SkillEntity({
      skillId: prisma.skill_id,
      unitId: prisma.unit_id,
      skillType: prisma.skill_type as SkillType,
      orderIndex: prisma.order_index,
      createdAt: prisma.created_at ?? new Date(),
      updatedAt: prisma.updated_at ?? new Date(),
      localizations,
    });
  }
}
