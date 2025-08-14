import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createTypeOrmConfig,
    }),
  ],
})
export class DatabaseModule {}

// Centralized configuration function
export function createTypeOrmConfig(configService: ConfigService): any {
  const dbUrl = configService.get('DATABASE_URL');

  if (!dbUrl) {
    throw new Error('Database URL is not defined in environment variables');
  }

  Logger.debug(`Connecting to Cloud database`, 'DatabaseModule');
  return {
    type: 'postgres',
    url: dbUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    autoLoadEntities: true,
    synchronize: configService.get('POSTGRES_SYNC') === 'true',
  };
}
