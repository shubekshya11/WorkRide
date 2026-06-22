import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Inject,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { RIDE_STATUS, USER_ROLE } from '../constants/enums';

import {
  DashboardStatsDto,
  ReportsDto,
  UpdateUserDto,
  SuspendUserDto,
  CancelRideDto,
} from '../dto/admin.dto';
import {
  CreateEmployeeDto,
  RejectRiderApplicationDto,
} from '../dto/onboarding.dto';
import { ProfileService } from '../services/profile.service';
import * as bcrypt from 'bcrypt';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { AuthenticatedRequest } from '../interfaces/types';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const [
      totalUsers,
      totalRides,
      activeRides,
      completedRides,
      cancelledRides,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.ride.count(),
      this.prisma.ride.count({ where: { status: RIDE_STATUS.ACTIVE } }),
      this.prisma.ride.count({ where: { status: RIDE_STATUS.COMPLETED } }),
      this.prisma.ride.count({ where: { status: RIDE_STATUS.CANCELLED } }),
    ]);

    const ridersCount = await this.prisma.user.count({
      where: { role: 'RIDER' },
    });
    const passengersCount = await this.prisma.user.count({
      where: { role: 'PASSENGER' },
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

  // ==================== USER MANAGEMENT ====================

  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { fullname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          fullname: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          profilePicture: true,
          ratings: true,
          karmaPoints: true,
          creditScore: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    this.logger.log({
      level: 'info',
      message: 'Admin fetched users list',
      tag: 'admin',
      count: users.length,
      total,
      page: pageNum,
    });

    return {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        profilePicture: true,
        ratings: true,
        karmaPoints: true,
        creditScore: true,
        createdAt: true,
        updatedAt: true,
        rides: {
          select: {
            id: true,
            from: true,
            to: true,
            status: true,
            timestamp: true,
            distance: true,
            co2Saved: true,
          },
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        karmaTransactions: {
          select: {
            id: true,
            points: true,
            type: true,
            reason: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log({
      level: 'info',
      message: 'Admin fetched user by ID',
      tag: 'admin',
      userId: parseInt(id, 10),
    });

    return user;
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateData: UpdateUserDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: updateData as Record<string, unknown>,
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        profilePicture: true,
        ratings: true,
        karmaPoints: true,
        creditScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log({
      level: 'info',
      message: 'Admin updated user',
      tag: 'admin',
      userId: parseInt(id, 10),
      updates: updateData,
    });

    return updatedUser;
  }

  @Post('users/:id/suspend')
  async suspendUser(
    @Param('id') id: string,
    @Body(ValidationPipe) suspendData: SuspendUserDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For now, we'll implement suspension by adding a note to the address field
    // In a real implementation, you'd want a proper suspension status field
    const updatedUser = await this.prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: {
        address: user.address
          ? `${user.address} [SUSPENDED: ${suspendData.reason}]`
          : `[SUSPENDED: ${suspendData.reason}]`,
      },
    });

    this.logger.log({
      level: 'warn',
      message: 'Admin suspended user',
      tag: 'admin',
      userId: parseInt(id, 10),
      reason: suspendData.reason,
    });

    return updatedUser;
  }

  @Post('users/:id/activate')
  async activateUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove suspension note from address
    const updatedUser = await this.prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: {
        address: user.address?.replace(/\[SUSPENDED: [^\]]+\]/g, '').trim() || null,
      },
    });

    this.logger.log({
      level: 'info',
      message: 'Admin activated user',
      tag: 'admin',
      userId: parseInt(id, 10),
    });

    return updatedUser;
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't allow deleting admin users
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Cannot delete admin users');
    }

    await this.prisma.user.delete({
      where: { id: parseInt(id, 10) },
    });

    this.logger.log({
      level: 'warn',
      message: 'Admin deleted user',
      tag: 'admin',
      userId: parseInt(id, 10),
    });

    return { message: 'User deleted successfully' };
  }

  // ==================== RIDE MANAGEMENT ====================

  @Get('rides')
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

  @Get('rides/:id')
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

  @Delete('rides/:id')
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

  @Post('rides/:id/cancel')
  async forceCancelRide(
    @Param('id') id: string,
    @Body(ValidationPipe) cancelData: CancelRideDto,
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
      reason: cancelData.reason,
    });

    return updatedRide;
  }

  // ==================== REPORTS & ANALYTICS ====================

  @Get('reports/daily')
  async getDailyReports(
    @Query('date') date?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const [
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
    ] = await Promise.all([
      this.prisma.ride.count({
        where: {
          timestamp: {
            gte: targetDate,
            lt: nextDate,
          },
        },
      }),
      this.prisma.ride.count({
        where: {
          timestamp: {
            gte: targetDate,
            lt: nextDate,
          },
          status: RIDE_STATUS.COMPLETED,
        },
      }),
      this.prisma.ride.count({
        where: {
          timestamp: {
            gte: targetDate,
            lt: nextDate,
          },
          status: RIDE_STATUS.CANCELLED,
        },
      }),
      this.prisma.ride.count({
        where: {
          timestamp: {
            gte: targetDate,
            lt: nextDate,
          },
          status: RIDE_STATUS.ACTIVE,
        },
      }),
    ]);

    const completedRidesData = await this.prisma.ride.findMany({
      where: {
        timestamp: {
          gte: targetDate,
          lt: nextDate,
        },
        status: RIDE_STATUS.COMPLETED,
      },
      select: {
        distance: true,
        co2Saved: true,
        peopleImpacted: true,
      },
    });

    const totalDistance = completedRidesData.reduce(
      (sum, ride) => sum + (ride.distance || 0),
      0,
    );
    const totalCo2Saved = completedRidesData.reduce(
      (sum, ride) => sum + (ride.co2Saved || 0),
      0,
    );
    const totalPeopleImpacted = completedRidesData.reduce(
      (sum, ride) => sum + (ride.peopleImpacted || 0),
      0,
    );

    this.logger.log({
      level: 'info',
      message: 'Admin fetched daily reports',
      tag: 'admin',
      date: targetDate.toISOString(),
    });

    return {
      date: targetDate.toISOString(),
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
      totalDistance,
      totalCo2Saved,
      totalPeopleImpacted,
    };
  }

  @Get('reports/monthly')
  async getMonthlyReports(
    @Query('month') month?: string,
  ) {
    const now = month ? new Date(month) : new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
      newUsers,
    ] = await Promise.all([
      this.prisma.ride.count({
        where: {
          timestamp: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      }),
      this.prisma.ride.count({
        where: {
          timestamp: {
            gte: firstDay,
            lte: lastDay,
          },
          status: RIDE_STATUS.COMPLETED,
        },
      }),
      this.prisma.ride.count({
        where: {
          timestamp: {
            gte: firstDay,
            lte: lastDay,
          },
          status: RIDE_STATUS.CANCELLED,
        },
      }),
      this.prisma.ride.count({
        where: {
          timestamp: {
            gte: firstDay,
            lte: lastDay,
          },
          status: RIDE_STATUS.ACTIVE,
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      }),
    ]);

    const completedRidesData = await this.prisma.ride.findMany({
      where: {
        timestamp: {
          gte: firstDay,
          lte: lastDay,
        },
        status: RIDE_STATUS.COMPLETED,
      },
      select: {
        distance: true,
        co2Saved: true,
        peopleImpacted: true,
      },
    });

    const totalDistance = completedRidesData.reduce(
      (sum, ride) => sum + (ride.distance || 0),
      0,
    );
    const totalCo2Saved = completedRidesData.reduce(
      (sum, ride) => sum + (ride.co2Saved || 0),
      0,
    );
    const totalPeopleImpacted = completedRidesData.reduce(
      (sum, ride) => sum + (ride.peopleImpacted || 0),
      0,
    );

    this.logger.log({
      level: 'info',
      message: 'Admin fetched monthly reports',
      tag: 'admin',
      month: firstDay.toISOString(),
    });

    return {
      month: firstDay.toISOString(),
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
      newUsers,
      totalDistance,
      totalCo2Saved,
      totalPeopleImpacted,
    };
  }

  @Get('reports/most-active-users')
  async getMostActiveUsers(
    @Query('limit') limit: string = '10',
    @Query('period') period: string = 'month',
  ) {
    const limitNum = parseInt(limit, 10) || 10;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const users = await this.prisma.user.findMany({
      where: {
        rides: {
          some: {
            timestamp: {
              gte: startDate,
            },
          },
        },
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        karmaPoints: true,
        creditScore: true,
        _count: {
          select: {
            rides: true,
          },
        },
      },
      orderBy: {
        rides: {
          _count: 'desc',
        },
      },
      take: limitNum,
    });

    this.logger.log({
      level: 'info',
      message: 'Admin fetched most active users',
      tag: 'admin',
      period,
      limit: limitNum,
    });

    return users.map(({ _count, ...user }) => ({
      ...user,
      totalRides: _count.rides,
    }));
  }

  @Get('reports/karma-stats')
  async getKarmaStats() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        karmaPoints: true,
        creditScore: true,
      },
      orderBy: {
        karmaPoints: 'desc',
      },
      take: 10,
    });

    const totalKarmaPoints = await this.prisma.user.aggregate({
      _sum: {
        karmaPoints: true,
      },
    });

    const totalCreditScore = await this.prisma.user.aggregate({
      _sum: {
        creditScore: true,
      },
    });

    this.logger.log({
      level: 'info',
      message: 'Admin fetched karma statistics',
      tag: 'admin',
    });

    return {
      topKarmaUsers: users,
      totalKarmaPoints: totalKarmaPoints._sum.karmaPoints || 0,
      totalCreditScore: totalCreditScore._sum.creditScore || 0,
    };
  }

  // ==================== EMPLOYEE MANAGEMENT ====================

  @Post('employees')
  async createEmployee(@Body(ValidationPipe) dto: CreateEmployeeDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    if (dto.employeeId) {
      const existingEmployeeId = await this.prisma.user.findUnique({
        where: { employeeId: dto.employeeId },
      });
      if (existingEmployeeId) {
        throw new BadRequestException('Employee ID already in use');
      }
    }

    const hashedPassword = await bcrypt.hash(
      dto.temporaryPassword,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    const user = await this.prisma.user.create({
      data: {
        fullname: dto.fullname,
        email: dto.email,
        password: hashedPassword,
        role: 'PASSENGER',
        employeeId: dto.employeeId,
        department: dto.department,
        phone: dto.phone,
        mustChangePassword: true,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        phone: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    this.logger.log({
      level: 'info',
      message: 'Admin created employee account',
      tag: 'admin',
      userId: user.id,
      email: user.email,
    });

    return {
      message: 'Employee account created. Share the temporary password securely.',
      user,
      temporaryPassword: dto.temporaryPassword,
    };
  }

  @Get('employees')
  async listEmployees(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {
      role: { not: 'ADMIN' },
    };

    if (search) {
      where.OR = [
        { fullname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullname: true,
          email: true,
          role: true,
          employeeId: true,
          department: true,
          phone: true,
          mustChangePassword: true,
          isSuspended: true,
          profilePicture: true,
          address: true,
          emergencyContact: true,
          dateOfBirth: true,
          createdAt: true,
          riderApplication: { select: { status: true, rejectionReason: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const employeesWithCompleteness = employees.map((employee) => ({
      ...employee,
      profileCompleteness: this.profileService.calculateCompleteness(employee)
        .percentage,
    }));

    return {
      employees: employeesWithCompleteness,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  // ==================== RIDER APPROVAL QUEUE ====================

  @Get('rider-applications')
  async listRiderApplications(
    @Query('status') status?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.riderApplication.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
              employeeId: true,
              department: true,
              phone: true,
              profilePicture: true,
            },
          },
        },
      }),
      this.prisma.riderApplication.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Post('rider-applications/:id/approve')
  async approveRiderApplication(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const application = await this.prisma.riderApplication.findUnique({
      where: { id: parseInt(id, 10) },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Rider application not found');
    }

    if (application.status !== 'PENDING_RIDER_APPROVAL') {
      throw new BadRequestException('Application is not pending approval');
    }

    const [updatedApplication] = await this.prisma.$transaction([
      this.prisma.riderApplication.update({
        where: { id: application.id },
        data: {
          status: 'APPROVED_RIDER',
          reviewedAt: new Date(),
          reviewedById: req.user.userId,
          rejectionReason: null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.user.update({
        where: { id: application.userId },
        data: { role: 'RIDER' },
      }),
    ]);

    this.logger.log({
      level: 'info',
      message: 'Admin approved rider application',
      tag: 'admin',
      applicationId: application.id,
      userId: application.userId,
    });

    return {
      message: 'Rider application approved',
      application: updatedApplication,
    };
  }

  @Post('rider-applications/:id/reject')
  async rejectRiderApplication(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: RejectRiderApplicationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const application = await this.prisma.riderApplication.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!application) {
      throw new NotFoundException('Rider application not found');
    }

    if (application.status !== 'PENDING_RIDER_APPROVAL') {
      throw new BadRequestException('Application is not pending approval');
    }

    const updatedApplication = await this.prisma.riderApplication.update({
      where: { id: application.id },
      data: {
        status: 'REJECTED_RIDER',
        rejectionReason: dto.reason,
        reviewedAt: new Date(),
        reviewedById: req.user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    this.logger.log({
      level: 'warn',
      message: 'Admin rejected rider application',
      tag: 'admin',
      applicationId: application.id,
      userId: application.userId,
      reason: dto.reason,
    });

    return {
      message: 'Rider application rejected',
      application: updatedApplication,
    };
  }
}