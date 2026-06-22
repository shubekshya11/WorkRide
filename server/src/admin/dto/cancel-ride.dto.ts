import { IsString, IsOptional } from 'class-validator';

export class CancelRideDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
