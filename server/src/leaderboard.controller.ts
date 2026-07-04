import {
  Controller,
  Get,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { PrismaService } from './prisma.service';
import { fetchLeaderboardData } from './utils/leaderboard.util';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  @Get()
  async getLeaderboard() {
    const data = await fetchLeaderboardData(this.prisma);

    this.logger.log({
      level: 'info',
      message: 'Leaderboard data fetched',
      tag: 'leaderboard',
    });

    return data;
  }
}
