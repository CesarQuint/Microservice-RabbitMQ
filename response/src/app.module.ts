import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReceiverService } from './response.listener';
import { RabbitMQModule } from './rabbit.mq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [AppController],
  providers: [ReceiverService, AppService],
})
export class AppModule {}
