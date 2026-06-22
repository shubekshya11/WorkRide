import type { StringValue } from 'ms';
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AuthController } from './auth.controller';
import { KarmaController } from './karma.controller';
import { LogsController } from './logs.controller';
import { RideController } from './ride.controller';
import { OnboardingController } from './onboarding/onboarding.controller';
import { RiderApplicationController } from './rider-application/rider-application.controller';
import { UploadController } from './upload/upload.controller';

import { AdminModule } from './admin/admin.module';

import { AppService } from './app.service';
import { EnvService } from './env.service';
import { PrismaService } from './prisma.service';
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { KarmaRedemptionService } from './services/karma-redemption.service';

import { RideGateway } from './rides/rides.gateway';
import { JwtStrategy } from './auth/jwt.strategy';

import { winstonLoggerConfig } from './logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(winstonLoggerConfig),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET') || '',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
            '1h') as StringValue,
        },
      }),
      global: true,
    }),
    AdminModule,
  ],
  controllers: [
    AppController,
    AuthController,
    OnboardingController,
    RiderApplicationController,
    UploadController,
    KarmaController,
    LogsController,
    RideController,
  ],
  providers: [
    AppService,
    EnvService,
    PrismaService,
    AuthService,
    ProfileService,
    KarmaRedemptionService,
    RideGateway,
    JwtStrategy,
  ],
})
export class AppModule {}
