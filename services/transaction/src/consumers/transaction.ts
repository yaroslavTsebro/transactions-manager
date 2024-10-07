import { ErrorHandler } from '@packages/system/error-handler';
import { TransactionService } from '../services/transaction';
import { ErrorMapping } from '@packages/data/contracts/error-handler';
import { config } from '../config';
import amqp from 'amqplib';
import { logger } from '../utils/logger';


export class TransactionConsumer {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;
  private transactionService: TransactionService;
  private errorHandler: ErrorHandler;
  private maxRetries: number;
  private dlxExchange: string;
  private dlqQueue: string;

  constructor(transactionService: TransactionService) {
    this.transactionService = transactionService;
    this.errorHandler = new ErrorHandler(this.getErrorMapping());
    this.maxRetries = config.MAX_RETRIES;
    this.dlxExchange = config.DLX_EXCHANGE;
    this.dlqQueue = config.DLQ_QUEUE;
  }

  private getErrorMapping(): ErrorMapping {
    return {
      InvalidTransactionError: { statusCode: 400 },
      DuplicateTransactionError: { statusCode: 409 },
      InsufficientFundsError: { statusCode: 400 },
      UserNotFoundError: { statusCode: 404 },
    };
  }

  async start(): Promise<void> {
    try {
      this.connection = await amqp.connect(config.MQ_URL);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.dlxExchange, 'direct', { durable: true });
      await this.channel.assertQueue(this.dlqQueue, { durable: true });
      await this.channel.bindQueue(this.dlqQueue, this.dlxExchange, this.dlqQueue);

      await this.channel.assertQueue(config.MQ_QUEUE, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': this.dlxExchange,
          'x-dead-letter-routing-key': this.dlqQueue,
        },
      });

      this.channel.consume(config.MQ_QUEUE, this.processMessage.bind(this), { noAck: false });
    } catch (error) {
      logger.error(error, 'Failed to start transaction consumer');
      process.exit(1);
    }
  }

  private async processMessage(msg: amqp.ConsumeMessage | null): Promise<void> {
    if (msg !== null) {
      const content = msg.content.toString();
      logger.info(`Received message: ${content}`);
      try {
        const message = JSON.parse(content);
        await this.transactionService.processTransaction(message);
        this.channel.ack(msg);
      } catch (error) {
        logger.error(error, 'Error processing transaction:');

        const headers = msg.properties.headers as any;
        const retries = headers['x-retries'] ? parseInt(headers['x-retries'], 10) : 0;

        if (retries < this.maxRetries) {
          const newHeaders = { ...headers, 'x-retries': retries + 1 };
          this.channel.nack(msg, false, false);

          this.channel.sendToQueue(config.MQ_QUEUE, msg.content, {
            headers: newHeaders,
            persistent: true,
          });
        } else {
          logger.error(`Message failed after ${retries} retries, sending to DLQ`);
          this.channel.reject(msg, false);
        }
      }
    }
  }

  async stop(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}
