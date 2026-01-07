/**
 * Role Domain Entity
 * Maps to auth.roles table
 */

export interface RoleProps {
  roleId: number;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RoleEntity {
  private props: RoleProps;

  constructor(props: RoleProps) {
    this.props = props;
  }

  get roleId(): number {
    return this.props.roleId;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPublicObject() {
    return {
      roleId: this.props.roleId,
      code: this.props.code,
      name: this.props.name,
    };
  }

  toProps(): RoleProps {
    return { ...this.props };
  }
}
