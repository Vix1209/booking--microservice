import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './authentication/auth/auth.module';
import { UsersModule } from './authentication/users/users.module';
import { BookingModule } from './booking/booking.module';
import { DatabaseModule } from '@db/database/database.module';

@Module({
  imports: [AuthModule, UsersModule, BookingModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
