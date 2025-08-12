import { NestFactory } from '@nestjs/core';
import { JobModule } from './job.module';

async function bootstrap() {
  const app = await NestFactory.create(JobModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
