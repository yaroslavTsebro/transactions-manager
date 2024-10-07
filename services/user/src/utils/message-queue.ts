import amqp from 'amqplib';
import { config } from '../config';

export class MessageQueue {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;
  private queue: string;

  constructor(queue: string) {
    this.queue = queue;
  }

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.queue);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queue, { durable: true });
  }

  async sendMessage(message: any): Promise<void> {
    const msgBuffer = Buffer.from(JSON.stringify(message));
    this.channel.sendToQueue(this.queue, msgBuffer, { persistent: true });
  }

  async close(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}

export const messageQueue = new MessageQueue(config.MQ_QUEUE);
