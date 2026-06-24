import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

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
  @Transform(emptyToUndefined)
  @IsString()
  @MinLength(1)
  fullname?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  phone?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  address?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  employeeId?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  dateOfBirth?: string;
}

export class RejectRiderApplicationDto {
  @IsString()
  reason: string;
}
