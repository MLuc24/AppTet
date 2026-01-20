/**
 * Unit Repository Port (Interface)
 * Manages unit operations within course versions
 */

import { UnitEntity, UnitLocalization } from '../entities/unit.entity';

export interface CreateUnitData {
  courseVersionId: string;
  orderIndex: number;
  localizations?: UnitLocalization[];
}

export interface UpdateUnitData {
  orderIndex?: number;
}

export interface IUnitRepository {
  // Query methods
  findById(unitId: string, languageId?: number): Promise<UnitEntity | null>;
  findByCourseVersionId(
    courseVersionId: string,
    languageId?: number,
  ): Promise<UnitEntity[]>;
  countByCourseVersionId(courseVersionId: string): Promise<number>;

  // Command methods
  create(data: CreateUnitData): Promise<UnitEntity>;
  update(unitId: string, data: UpdateUnitData): Promise<UnitEntity>;
  delete(unitId: string): Promise<void>;

  // Bulk operations
  reorder(unitIds: string[]): Promise<void>;

  // Localization methods
  addLocalization(
    unitId: string,
    localization: UnitLocalization,
  ): Promise<void>;
  updateLocalization(
    unitId: string,
    localization: UnitLocalization,
  ): Promise<void>;
  deleteLocalization(unitId: string, languageId: number): Promise<void>;

  // Helper methods
  getNextOrderIndex(courseVersionId: string): Promise<number>;
}
