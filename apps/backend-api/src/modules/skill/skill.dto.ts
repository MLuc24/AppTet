/**
 * Skill Module DTOs
 * Request and Response DTOs for skill endpoints
 */

import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ValidateNested,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SkillType } from '../../domain/entities/skill.entity';

// ============ REQUEST DTOs ============

export class SkillLocalizationDto {
  @ApiProperty({ example: 1, description: 'Language ID' })
  @IsInt()
  languageId: number;

  @ApiProperty({ example: 'Basic Vocabulary' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Learn essential words' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateSkillDto {
  @ApiProperty({ enum: SkillType, example: SkillType.VOCABULARY })
  @IsEnum(SkillType)
  skillType: SkillType;

  @ApiPropertyOptional({ type: [SkillLocalizationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillLocalizationDto)
  localizations?: SkillLocalizationDto[];
}

export class UpdateSkillDto {
  @ApiPropertyOptional({ enum: SkillType })
  @IsOptional()
  @IsEnum(SkillType)
  skillType?: SkillType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class ReorderSkillsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of skill IDs in new order',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds: string[];
}

export class AddSkillLocalizationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  languageId: number;

  @ApiProperty({ example: 'Basic Vocabulary' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Learn essential words' })
  @IsOptional()
  @IsString()
  description?: string;
}

// ============ RESPONSE DTOs ============

export class SkillLocalizationResponseDto {
  @ApiProperty()
  languageId: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;
}

export class SkillResponseDto {
  @ApiProperty()
  skillId: string;

  @ApiProperty()
  unitId: string;

  @ApiProperty({ enum: SkillType })
  skillType: SkillType;

  @ApiProperty()
  orderIndex: number;

  @ApiProperty({ type: [SkillLocalizationResponseDto] })
  localizations: SkillLocalizationResponseDto[];

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SkillListResponseDto {
  @ApiProperty({ type: [SkillResponseDto] })
  data: SkillResponseDto[];

  @ApiProperty()
  total: number;
}
