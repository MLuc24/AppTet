import { Controller, Get, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { GamificationService } from './gamification.service';
import { StreakResponseDto } from './gamification.dto';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('streak')
  @ApiOperation({ summary: 'Get streak summary and week status' })
  @ApiResponse({ status: 200, type: StreakResponseDto })
  async getStreak(
    @CurrentUser('userId') userId: string,
    @Headers('x-timezone') timeZoneHeader?: string,
  ): Promise<StreakResponseDto> {
    const timeZone = timeZoneHeader || 'UTC';
    return this.gamificationService.getStreak(userId, timeZone);
  }
}
