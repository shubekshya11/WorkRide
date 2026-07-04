import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  ValidationPipe,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { USER_ROLE } from '../constants/enums';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../interfaces/types';
import { IsString } from 'class-validator';

class SubmitRiderApplicationDto {
  @IsString()
  drivingLicenseNumber: string;

  @IsString()
  drivingLicenseImageUrl: string;

  @IsString()
  vehicleNumber: string;

  @IsString()
  vehicleType: string;

  @IsString()
  vehicleModel: string;

  @IsString()
  vehicleColor: string;

  @IsString()
  vehicleRegistrationUrl: string;
}

@Controller('rider-applications')
@UseGuards(JwtAuthGuard)
export class RiderApplicationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async getMyApplication(@Request() req: AuthenticatedRequest) {
    return this.prisma.riderApplication.findUnique({
      where: { userId: req.user.userId },
    });
  }

  @Post()
  async submitApplication(
    @Request() req: AuthenticatedRequest,
    @Body(ValidationPipe) body: SubmitRiderApplicationDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { riderApplication: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role.toLowerCase() === USER_ROLE.ADMIN) {
      throw new BadRequestException('Admins cannot apply as riders');
    }

    if (user.riderApplication?.status === 'PENDING_RIDER_APPROVAL') {
      throw new ConflictException('You already have a pending application');
    }

    if (user.riderApplication?.status === 'APPROVED_RIDER') {
      throw new ConflictException('Your rider application is already approved');
    }

    const application = await this.prisma.riderApplication.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...body,
        status: 'PENDING_RIDER_APPROVAL',
        rejectionReason: null,
        reviewedAt: null,
        reviewedById: null,
      },
      update: {
        ...body,
        status: 'PENDING_RIDER_APPROVAL',
        rejectionReason: null,
        reviewedAt: null,
        reviewedById: null,
      },
    });

    return {
      message: 'Rider application submitted successfully',
      application,
    };
  }
}
