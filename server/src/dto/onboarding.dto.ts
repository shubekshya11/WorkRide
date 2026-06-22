import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsDateString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  temporaryPassword: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullname?: string;

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
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

export class RejectRiderApplicationDto {
  @IsString()
  reason: string;
}
