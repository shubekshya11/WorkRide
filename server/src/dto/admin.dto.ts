import { IsString, IsOptional, IsNumber, IsEnum, Min, IsBoolean } from 'class-validator';
import { USER_ROLE } from '../constants/enums';

// ==================== DASHBOARD DTOs ====================

export class DashboardStatsDto {
  totalUsers: number;
  totalRiders: number;
  totalPassengers: number;
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
}

// ==================== USER MANAGEMENT DTOs ====================

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(USER_ROLE)
  role?: USER_ROLE;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ratings?: number;

  @IsOptional()
  @IsNumber()
  karmaPoints?: number;

  @IsOptional()
  @IsNumber()
  creditScore?: number;

  @IsOptional()
  @IsBoolean()
  suspended?: boolean;
}

export class SuspendUserDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;
}

// ==================== RIDE MANAGEMENT DTOs ====================

export class CancelRideDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RideManagementDto {
  id: number;
  from: string;
  to: string;
  role: string;
  status: string;
  timestamp: Date;
  distance?: number;
  co2Saved?: number;
  peopleImpacted?: number;
  rider?: {
    id: number;
    fullname: string;
    email: string;
    role: string;
  };
  passengers?: Array<{
    id: number;
    fullname: string;
    email: string;
    role: string;
  }>;
  createdByUser?: {
    id: number;
    fullname: string;
    email: string;
    role: string;
  };
}

// ==================== REPORTS DTOs ====================

export class ReportsDto {
  period: string;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  totalDistance: number;
  totalCo2Saved: number;
  totalPeopleImpacted: number;
  newUsers?: number;
}

export class MostActiveUsersDto {
  id: number;
  fullname: string;
  email: string;
  role: string;
  karmaPoints: number;
  creditScore: number;
  totalRides: number;
}

export class KarmaStatsDto {
  topKarmaUsers: Array<{
    id: number;
    fullname: string;
    email: string;
    role: string;
    karmaPoints: number;
    creditScore: number;
  }>;
  totalKarmaPoints: number;
  totalCreditScore: number;
}

// ==================== PAGINATION DTOs ====================

export class PaginationDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationDto;
}