import { ApiProperty } from '@nestjs/swagger';

export class StreakDayDto {
  @ApiProperty()
  date: string;

  @ApiProperty({ enum: ['done', 'today', 'missed', 'future', 'frozen'] })
  status: 'done' | 'today' | 'missed' | 'future' | 'frozen';
}

export class StreakWeekDto {
  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty({ type: [StreakDayDto] })
  days: StreakDayDto[];
}

export class StreakResponseDto {
  @ApiProperty()
  currentDays: number;

  @ApiProperty()
  longestDays: number;

  @ApiProperty()
  freezeCount: number;

  @ApiProperty()
  lastActivityDate: string | null;

  @ApiProperty({ type: StreakWeekDto })
  week: StreakWeekDto;
}
