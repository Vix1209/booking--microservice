import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { BookingReminderProcessor } from './processors/booking-reminder.processor';
import { SharedModule } from '@shared/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'booking-jobs',
    }),
    SharedModule,
  ],
  controllers: [JobController],
  providers: [JobService, BookingReminderProcessor],
})
export class JobModule {}
