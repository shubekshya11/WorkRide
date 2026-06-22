import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class SuspendUserDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;
}
