/**
 * Unit Module DTOs
 * Request and Response DTOs for unit endpoints
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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ============ REQUEST DTOs ============

export class UnitLocalizationDto {
  @ApiProperty({ example: 1, description: 'Language ID' })
  @IsInt()
  languageId: number;

  @ApiProperty({ example: 'Getting Started' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Introduction to basic concepts' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateUnitDto {
  @ApiPropertyOptional({ type: [UnitLocalizationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitLocalizationDto)
  localizations?: UnitLocalizationDto[];
}

export class UpdateUnitDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class ReorderUnitsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of unit IDs in new order',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  unitIds: string[];
}

export class AddUnitLocalizationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  languageId: number;

  @ApiProperty({ example: 'Getting Started' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Introduction to basic concepts' })
  @IsOptional()
  @IsString()
  description?: string;
}

// ============ RESPONSE DTOs ============

export class UnitLocalizationResponseDto {
  @ApiProperty()
  languageId: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;
}

export class UnitResponseDto {
  @ApiProperty()
  unitId: string;

  @ApiProperty()
  courseVersionId: string;

  @ApiProperty()
  orderIndex: number;

  @ApiProperty({ type: [UnitLocalizationResponseDto] })
  localizations: UnitLocalizationResponseDto[];

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UnitListResponseDto {
  @ApiProperty({ type: [UnitResponseDto] })
  data: UnitResponseDto[];

  @ApiProperty()
  total: number;
}
