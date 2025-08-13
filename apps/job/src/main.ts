import { NestFactory } from '@nestjs/core';
import { JobModule } from './job.module';

async function bootstrap() {
  const app = await NestFactory.create(JobModule);
  await app.listen(process.env.JOB_PORT ?? 3000);
}
bootstrap();
