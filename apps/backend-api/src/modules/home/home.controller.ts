import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { HomeService } from './home.service';
import { HomeContinueResponseDto, HomeSummaryResponseDto } from './home.dto';

@ApiTags('Home')
@ApiBearerAuth()
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiResponse({ status: 200, type: HomeSummaryResponseDto })
  async getSummary(
    @CurrentUser('userId') userId: string,
  ): Promise<HomeSummaryResponseDto> {
    return this.homeService.getSummary(userId);
  }

  @Get('continue')
  @ApiOperation({ summary: 'Get continue learning card data' })
  @ApiResponse({ status: 200, type: HomeContinueResponseDto })
  async getContinue(
    @CurrentUser('userId') userId: string,
  ): Promise<HomeContinueResponseDto> {
    return this.homeService.getContinue(userId);
  }
}
