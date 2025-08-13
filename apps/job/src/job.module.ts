import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { BookingReminderProcessor } from './processors/booking-reminder.processor';
import { SharedModule } from '@shared/shared';
import { DatabaseModule } from '@db/database/database.module';
import { redisConfig } from 'config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
    BullModule.registerQueue({
      name: 'booking-jobs',
    }),
    DatabaseModule,
    SharedModule,
  ],
  controllers: [JobController],
  providers: [JobService, BookingReminderProcessor],
})
export class JobModule {}
