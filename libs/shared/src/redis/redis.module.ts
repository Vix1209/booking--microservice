import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisConfig } from 'config/redis.config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<RedisConfig>('redis');
        const redisConfig = config?.url;
        const defaultJobOptions = config?.default;
        return {
          redis: redisConfig,
          defaultJobOptions: defaultJobOptions,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService, ConfigService],
  exports: [RedisService, BullModule],
})
export class RedisModule {}
