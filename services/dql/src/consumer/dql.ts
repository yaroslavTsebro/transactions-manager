import amqp from 'amqplib';
import { config } from '../config';
import { logger } from '@transaction/src/utils/logger';
import { DLQHandler } from '../handler/dql';

export class DLQConsumer {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;
  private dlqHandler: DLQHandler;

  constructor(dlqHandler: DLQHandler) {
    this.dlqHandler = dlqHandler;
  }

  async start(): Promise<void> {
    try {
      this.connection = await amqp.connect(config.MQ_URL);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(config.DLQ_QUEUE, { durable: true });

      this.channel.consume(
        config.DLQ_QUEUE,
        this.processMessage.bind(this),
        { noAck: false }
      );

      logger.info(`DLQ Consumer started, listening on queue: ${config.DLQ_QUEUE}`);
    } catch (error) {
      logger.error(error, 'Failed to start DLQ Consumer:');
      process.exit(1);
    }
  }

  private async processMessage(msg: amqp.ConsumeMessage | null): Promise<void> {
    if (msg !== null) {
      const content = msg.content.toString();
      logger.info(`Received message from DLQ: ${content}`);
      try {
        const message = JSON.parse(content);
        await this.dlqHandler.handleMessage(message);
        this.channel.ack(msg);
      } catch (error) {
        logger.error(error, 'Error processing DLQ message:');
        this.channel.reject(msg, false);
      }
    }
  }

  async stop(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}
