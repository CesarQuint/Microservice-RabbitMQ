// emitter.service.ts
import { Injectable } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class HellowService {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  async emitUserEvent(eventType: string, data: any) {
    await this.rabbitmq.publish('events_exchange', `user.${eventType}`, {
      timestamp: new Date(),
      data,
    });
  }

  async emitOrderEvent(eventType: string, data: any) {
    await this.rabbitmq.publish('orders_exchange', `order.${eventType}`, data);
  }

  async broadcastNotification(data: any) {
    // Fanout exchange - routing key ignored
    await this.rabbitmq.publish('notifications_exchange', '', data);
  }
}
