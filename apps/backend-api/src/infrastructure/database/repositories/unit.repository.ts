/**
 * Unit Repository Implementation with Prisma
 * Infrastructure layer - implements IUnitRepository port
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient, units as PrismaUnit } from '@prisma/client';
import {
  IUnitRepository,
  CreateUnitData,
  UpdateUnitData,
} from '../../../domain/ports/unit-repository.port';
import {
  UnitEntity,
  UnitLocalization,
} from '../../../domain/entities/unit.entity';

@Injectable()
export class UnitRepository implements IUnitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(
    unitId: string,
    languageId?: number,
  ): Promise<UnitEntity | null> {
    const unit = await this.prisma.units.findUnique({
      where: { unit_id: unitId },
      include: { unit_localizations: true },
    });
    return unit ? this.toDomain(unit, languageId) : null;
  }

  async findByCourseVersionId(
    courseVersionId: string,
    languageId?: number,
  ): Promise<UnitEntity[]> {
    const units = await this.prisma.units.findMany({
      where: { course_version_id: courseVersionId },
      include: { unit_localizations: true },
      orderBy: { order_index: 'asc' },
    });
    return units.map((u) => this.toDomain(u, languageId));
  }

  async countByCourseVersionId(courseVersionId: string): Promise<number> {
    return this.prisma.units.count({
      where: { course_version_id: courseVersionId },
    });
  }

  async create(data: CreateUnitData): Promise<UnitEntity> {
    const unit = await this.prisma.units.create({
      data: {
        course_version_id: data.courseVersionId,
        order_index: data.orderIndex,
        unit_localizations: data.localizations?.length
          ? {
              create: data.localizations.map((l) => ({
                language_id: l.languageId,
                title: l.title,
                description: l.description,
              })),
            }
          : undefined,
      },
      include: { unit_localizations: true },
    });
    return this.toDomain(unit);
  }

  async update(unitId: string, data: UpdateUnitData): Promise<UnitEntity> {
    const updateData: Record<string, unknown> = {};
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

    const unit = await this.prisma.units.update({
      where: { unit_id: unitId },
      data: updateData,
      include: { unit_localizations: true },
    });
    return this.toDomain(unit);
  }

  async delete(unitId: string): Promise<void> {
    await this.prisma.units.delete({ where: { unit_id: unitId } });
  }

  async reorder(unitIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      unitIds.map((id, index) =>
        this.prisma.units.update({
          where: { unit_id: id },
          data: { order_index: index },
        }),
      ),
    );
  }

  async addLocalization(
    unitId: string,
    localization: UnitLocalization,
  ): Promise<void> {
    await this.prisma.unit_localizations.create({
      data: {
        unit_id: unitId,
        language_id: localization.languageId,
        title: localization.title,
        description: localization.description,
      },
    });
  }

  async updateLocalization(
    unitId: string,
    localization: UnitLocalization,
  ): Promise<void> {
    await this.prisma.unit_localizations.update({
      where: {
        unit_id_language_id: {
          unit_id: unitId,
          language_id: localization.languageId,
        },
      },
      data: {
        title: localization.title,
        description: localization.description,
      },
    });
  }

  async deleteLocalization(unitId: string, languageId: number): Promise<void> {
    await this.prisma.unit_localizations.delete({
      where: {
        unit_id_language_id: { unit_id: unitId, language_id: languageId },
      },
    });
  }

  async getNextOrderIndex(courseVersionId: string): Promise<number> {
    const max = await this.prisma.units.aggregate({
      where: { course_version_id: courseVersionId },
      _max: { order_index: true },
    });
    return (max._max.order_index ?? -1) + 1;
  }

  private toDomain(
    prisma: PrismaUnit & {
      unit_localizations?: Array<{
        language_id: number;
        title: string;
        description: string | null;
      }>;
    },
    _languageId?: number,
  ): UnitEntity {
    const localizations: UnitLocalization[] =
      prisma.unit_localizations?.map((l) => ({
        languageId: l.language_id,
        title: l.title,
        description: l.description ?? undefined,
      })) || [];

    return new UnitEntity({
      unitId: prisma.unit_id,
      courseVersionId: prisma.course_version_id,
      orderIndex: prisma.order_index,
      createdAt: prisma.created_at ?? new Date(),
      updatedAt: prisma.updated_at ?? new Date(),
      localizations,
    });
  }
}
