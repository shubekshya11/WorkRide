import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { PrismaService } from '../../prisma.service';
import { RIDE_STATUS } from '../../constants/enums';
import { CancelRideDto } from '../dto/cancel-ride.dto';

@Controller('admin/rides')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RidesController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  @Get()
  async getRides(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (role) {
      where.role = role;
    }

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          rider: {
            select: {
              id: true,
              fullname: true,
              email: true,
              role: true,
            },
          },
          passengers: {
            select: {
              id: true,
              fullname: true,
              email: true,
              role: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              fullname: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.ride.count({ where }),
    ]);

    this.logger.log({
      level: 'info',
      message: 'Admin fetched rides list',
      tag: 'admin',
      count: rides.length,
      total,
      page: pageNum,
    });

    return {
      rides,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Get(':id')
  async getRideById(@Param('id') id: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        rider: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
            phone: true,
            ratings: true,
          },
        },
        passengers: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
            phone: true,
            ratings: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        feedback: {
          include: {
            fromUser: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
            toUser: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    this.logger.log({
      level: 'info',
      message: 'Admin fetched ride by ID',
      tag: 'admin',
      rideId: parseInt(id, 10),
    });

    return ride;
  }

  @Delete(':id')
  async deleteRide(@Param('id') id: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    await this.prisma.ride.delete({
      where: { id: parseInt(id, 10) },
    });

    this.logger.log({
      level: 'warn',
      message: 'Admin deleted ride',
      tag: 'admin',
      rideId: parseInt(id, 10),
    });

    return { message: 'Ride deleted successfully' };
  }

  @Post(':id/cancel')
  async forceCancelRide(
    @Param('id') id: string,
    @Body() cancelData?: CancelRideDto,
  ) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.status === RIDE_STATUS.CANCELLED) {
      throw new BadRequestException('Ride is already cancelled');
    }

    if (ride.status === RIDE_STATUS.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed ride');
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: parseInt(id, 10) },
      data: { status: RIDE_STATUS.CANCELLED },
      include: {
        rider: true,
        passengers: true,
        createdByUser: true,
      },
    });

    this.logger.log({
      level: 'warn',
      message: 'Admin force cancelled ride',
      tag: 'admin',
      rideId: parseInt(id, 10),
      reason: cancelData?.reason,
    });

    return updatedRide;
  }
}
