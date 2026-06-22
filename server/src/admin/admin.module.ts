import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma.service';
import { ProfileService } from '../services/profile.service';

@Module({
  controllers: [AdminController],
  providers: [PrismaService, ProfileService],
})
export class AdminModule {}
