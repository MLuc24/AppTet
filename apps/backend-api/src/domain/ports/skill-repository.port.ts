/**
 * Skill Repository Port (Interface)
 * Manages skill operations within units
 */

import {
  SkillEntity,
  SkillType,
  SkillLocalization,
} from '../entities/skill.entity';

export interface CreateSkillData {
  unitId: string;
  skillType: SkillType;
  orderIndex: number;
  localizations?: SkillLocalization[];
}

export interface UpdateSkillData {
  skillType?: SkillType;
  orderIndex?: number;
}

export interface ISkillRepository {
  // Query methods
  findById(skillId: string, languageId?: number): Promise<SkillEntity | null>;
  findByUnitId(unitId: string, languageId?: number): Promise<SkillEntity[]>;
  countByUnitId(unitId: string): Promise<number>;

  // Command methods
  create(data: CreateSkillData): Promise<SkillEntity>;
  update(skillId: string, data: UpdateSkillData): Promise<SkillEntity>;
  delete(skillId: string): Promise<void>;

  // Bulk operations
  reorder(skillIds: string[]): Promise<void>;

  // Localization methods
  addLocalization(
    skillId: string,
    localization: SkillLocalization,
  ): Promise<void>;
  updateLocalization(
    skillId: string,
    localization: SkillLocalization,
  ): Promise<void>;
  deleteLocalization(skillId: string, languageId: number): Promise<void>;

  // Helper methods
  getNextOrderIndex(unitId: string): Promise<number>;
}
