import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './authentication/auth/auth.module';
import { UsersModule } from './authentication/users/users.module';
import { BookingModule } from './booking/booking.module';
import { DatabaseModule } from '@db/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@shared/shared';
import { redisConfig } from 'config/redis.config';
import { JobService } from 'apps/job/src/job.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
    AuthModule,
    UsersModule,
    SharedModule,
    BookingModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [JobService],
})
export class AppModule {}
