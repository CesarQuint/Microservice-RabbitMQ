// rabbitmq.service.ts - Full control over exchanges and routing
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect('amqp://localhost:5672');
      this.channel = await this.connection.createChannel();

      // Create your custom exchanges
      await this.setupExchanges();
      console.log('✅ Connected to RabbitMQ with custom exchanges');
    } catch (error) {
      console.error('❌ RabbitMQ connection failed:', error);
    }
  }

  //TODO:FACTORY
  private async setupExchanges() {
    // Define all your custom exchanges
    await this.channel.assertExchange('events_exchange', 'topic', {
      durable: false,
    });
    await this.channel.assertExchange('notifications_exchange', 'fanout', {
      durable: false,
    });
    await this.channel.assertExchange('orders_exchange', 'direct', {
      durable: false,
    });
    await this.channel.assertExchange('analytics_exchange', 'headers', {
      durable: false,
    });
  }

  // Publish with full control
  async publish(
    exchange: string,
    routingKey: string,
    message: any,
    options?: amqp.Options.Publish,
  ) {
    const content = Buffer.from(JSON.stringify(message));
    return this.channel.publish(exchange, routingKey, content, {
      persistent: true,
      ...options,
    });
  }

  // Subscribe with full control
  async subscribe(
    exchange: string,
    routingKey: string,
    queueName: string,
    handler: (message: any) => void,
    options?: {
      exchangeType?: 'topic' | 'direct' | 'fanout' | 'headers';
      queueOptions?: amqp.Options.AssertQueue;
      consumeOptions?: amqp.Options.Consume;
    },
  ) {
    // Assert exchange and queue
    await this.channel.assertExchange(
      exchange,
      options?.exchangeType || 'topic',
      { durable: false },
    );
    const queue = await this.channel.assertQueue(queueName, {
      durable: false,
      ...options?.queueOptions,
    });

    // Bind queue to exchange with routing key
    await this.channel.bindQueue(queue.queue, exchange, routingKey);

    // Consume messages
    await this.channel.consume(
      queue.queue,
      (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;

            console.log(`📨 Received message on ${routingKey}:`, content);
            handler({ content, routingKey, originalMessage: msg });

            // Acknowledge message
            this.channel.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            this.channel.nack(msg, false, false); // Reject message
          }
        }
      },
      options?.consumeOptions,
    );
  }

  private async disconnect() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}
