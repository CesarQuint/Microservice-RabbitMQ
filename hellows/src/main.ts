// main.ts (No changes needed - this is fine)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  // This is optional if you only emit events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
  app.useLogger(logger);
  logger.log('LISTENING ON PORT 3000');
}
bootstrap();
