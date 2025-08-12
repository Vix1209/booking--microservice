import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedService } from './shared.service';
import { RedisModule } from './redis/redis.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [ConfigModule, RedisModule, WebSocketModule],
  providers: [SharedService],
  exports: [SharedService, RedisModule, WebSocketModule],
})
export class SharedModule {}
