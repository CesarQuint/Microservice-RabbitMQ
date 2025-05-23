// receiver.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbit.mq.service';

@Injectable()
export class ReceiverService implements OnModuleInit {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  async onModuleInit() {
    // Subscribe to user events
    await this.rabbitmq.subscribe(
      'events_exchange',
      'user.*',
      'user_events_queue',
      this.handleUserEvent.bind(this),
    );

    // Subscribe to order events
    await this.rabbitmq.subscribe(
      'orders_exchange',
      'order.created',
      'order_events_queue',
      this.handleOrderEvent.bind(this),
      {
        exchangeType: 'direct',
      },
    );

    // Subscribe to all critical events
    await this.rabbitmq.subscribe(
      'events_exchange',
      '*.critical',
      'critical_events_queue',
      this.handleCriticalEvent.bind(this),
    );
  }

  private handleUserEvent({ content, routingKey }) {
    console.log(`🎉 User event ${routingKey}:`, content);
  }

  private handleOrderEvent({ content, routingKey }) {
    console.log(`📦 Order event ${routingKey}:`, content);
  }

  private handleCriticalEvent({ content, routingKey }) {
    console.log(`🚨 Critical event ${routingKey}:`, content);
  }
}
