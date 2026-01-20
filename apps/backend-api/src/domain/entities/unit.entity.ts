/**
 * Unit Domain Entity
 * Course section containing skills
 * Maps to content.units table
 */

export interface UnitLocalization {
  languageId: number;
  title: string;
  description?: string;
}

export interface UnitProps {
  unitId: string;
  courseVersionId: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  localizations?: UnitLocalization[];
}

export class UnitEntity {
  private props: UnitProps;

  constructor(props: UnitProps) {
    this.props = props;
  }

  // Getters
  get unitId(): string {
    return this.props.unitId;
  }

  get courseVersionId(): string {
    return this.props.courseVersionId;
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

  get localizations(): UnitLocalization[] {
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
  static create(courseVersionId: string, orderIndex: number): UnitEntity {
    return new UnitEntity({
      unitId: '',
      courseVersionId,
      orderIndex,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toObject(): UnitProps {
    return { ...this.props };
  }
}
