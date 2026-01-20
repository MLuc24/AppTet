/**
 * Skill Domain Entity
 * Learning skill within a unit (vocabulary, grammar, listening, etc.)
 * Maps to content.skills table
 */

export enum SkillType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  READING = 'reading',
  WRITING = 'writing',
  MIXED = 'mixed',
}

export interface SkillLocalization {
  languageId: number;
  title: string;
  description?: string;
}

export interface SkillProps {
  skillId: string;
  unitId: string;
  skillType: SkillType;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  localizations?: SkillLocalization[];
}

export class SkillEntity {
  private props: SkillProps;

  constructor(props: SkillProps) {
    this.props = props;
  }

  // Getters
  get skillId(): string {
    return this.props.skillId;
  }

  get unitId(): string {
    return this.props.unitId;
  }

  get skillType(): SkillType {
    return this.props.skillType;
  }

  get orderIndex(): number {
    return this.props.orderIndex;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get localizations(): SkillLocalization[] {
    return this.props.localizations || [];
  }

  // Business Methods
  getTitle(languageId: number): string | undefined {
    const localization = this.localizations.find(
      (l) => l.languageId === languageId,
    );
    return localization?.title;
  }

  getDescription(languageId: number): string | undefined {
    const localization = this.localizations.find(
      (l) => l.languageId === languageId,
    );
    return localization?.description;
  }

  hasLocalization(): boolean {
    return this.localizations.length > 0;
  }

  // Factory method
  static create(
    unitId: string,
    skillType: SkillType,
    orderIndex: number,
  ): SkillEntity {
    return new SkillEntity({
      skillId: '',
      unitId,
      skillType,
      orderIndex,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toObject(): SkillProps {
    return { ...this.props };
  }
}
