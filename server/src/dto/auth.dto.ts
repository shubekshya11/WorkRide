import { IsString, IsOptional, IsEmail, IsIn, IsEnum } from 'class-validator';
import { USER_ROLE } from '../constants/enums';

export class LogoutDto {
  @IsString()
  refreshToken: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class SignupDto {
  @IsString()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(USER_ROLE)
  role: USER_ROLE;

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
  ratings?: number;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class DeleteAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
