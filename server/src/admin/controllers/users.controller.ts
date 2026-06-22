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
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { PrismaService } from '../../prisma.service';
import { USER_ROLE } from '../../constants/enums';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SuspendUserDto } from '../dto/suspend-user.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  @Get()
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

  @Get(':id')
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

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
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

  @Post(':id/suspend')
  async suspendUser(@Param('id') id: string, @Body() suspendData: SuspendUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

  @Post(':id/activate')
  async activateUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === USER_ROLE.ADMIN) {
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
}
