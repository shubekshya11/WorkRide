import { IsString, IsOptional, IsNumber, IsEnum, Min, IsBoolean } from 'class-validator';
import { USER_ROLE } from '../../constants/enums';

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
