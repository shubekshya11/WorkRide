import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { PrismaService } from '../../prisma.service';
import { USER_ROLE } from '../../constants/enums';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminGuard)
export class DashboardController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  @Get()
  async getDashboardStats() {
    const [
      totalUsers,
      totalRides,
      activeRides,
      completedRides,
      cancelledRides,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.ride.count(),
      this.prisma.ride.count({ where: { status: 'ACTIVE' } }),
      this.prisma.ride.count({ where: { status: 'COMPLETED' } }),
      this.prisma.ride.count({ where: { status: 'CANCELLED' } }),
    ]);

    const ridersCount = await this.prisma.riderApplication.count({
      where: { status: 'APPROVED_RIDER' },
    });
    const passengersCount = await this.prisma.user.count({
      where: { role: 'USER' },
    });

    this.logger.log({
      level: 'info',
      message: 'Admin dashboard stats fetched',
      tag: 'admin',
    });

    return {
      totalUsers,
      totalRiders: ridersCount,
      totalPassengers: passengersCount,
      totalRides,
      activeRides,
      completedRides,
      cancelledRides,
    };
  }
}
