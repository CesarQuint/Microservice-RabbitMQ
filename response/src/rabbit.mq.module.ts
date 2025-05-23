import { Module, Global } from '@nestjs/common';
import { RabbitMQService } from './rabbit.mq.service';

@Global()
@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
