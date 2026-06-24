import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Request,
  UseGuards,
  ValidationPipe,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma.service';
import { ProfileService } from '../services/profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../interfaces/types';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { USER_ROLE } from '../constants/enums';
import {
  ChangePasswordDto,
  UpdateProfileDto,
} from '../dto/onboarding.dto';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  @Get('onboarding-status')
  async getOnboardingStatus(@Request() req: AuthenticatedRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { riderApplication: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profile = this.profileService.calculateCompleteness(user);

    return {
      mustChangePassword: user.mustChangePassword,
      isSuspended: user.isSuspended,
      profileCompleteness: profile.percentage,
      completedFields: profile.completedFields,
      missingFields: profile.missingFields,
      riderApplicationStatus: user.riderApplication?.status ?? null,
      rejectionReason: user.riderApplication?.rejectionReason ?? null,
      role: user.role,
      isApprovedRider:
        user.role.toLowerCase() === USER_ROLE.RIDER &&
        user.riderApplication?.status === 'APPROVED_RIDER',
    };
  }

  @Get('profile-completeness')
  async getProfileCompleteness(@Request() req: AuthenticatedRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.profileService.calculateCompleteness(user);
  }

  @Post('change-password')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body(ValidationPipe) body: ChangePasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await bcrypt.compare(body.currentPassword, user.password);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(
      body.newPassword,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return { message: 'Password changed successfully' };
  }

  @Put('profile')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    body: UpdateProfileDto,
  ) {
    const data: Prisma.UserUpdateInput = {};

    if (body.fullname !== undefined) data.fullname = body.fullname;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.address !== undefined) data.address = body.address;
    if (body.profilePicture !== undefined) data.profilePicture = body.profilePicture;
    if (body.department !== undefined) data.department = body.department;
    if (body.emergencyContact !== undefined) {
      data.emergencyContact = body.emergencyContact;
    }
    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = new Date(body.dateOfBirth);
    }

    if (body.employeeId !== undefined) {
      const existing = await this.prisma.user.findUnique({
        where: { employeeId: body.employeeId },
      });
      if (existing && existing.id !== req.user.userId) {
        throw new BadRequestException('Employee ID already in use');
      }
      data.employeeId = body.employeeId;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No profile fields to update');
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: req.user.userId },
        data,
        select: {
          id: true,
          fullname: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          profilePicture: true,
          employeeId: true,
          department: true,
          emergencyContact: true,
          dateOfBirth: true,
          mustChangePassword: true,
        },
      });

      const profile = this.profileService.calculateCompleteness(user);

      return {
        user,
        profileCompleteness: profile.percentage,
        completedFields: profile.completedFields,
        missingFields: profile.missingFields,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Employee ID already in use');
      }
      throw error;
    }
  }
}
