import { DLQConsumer } from './consumer/dql';
import { DLQHandler } from './handler/dql';
import { TransactionRepository } from './repository/transaction';
import { database } from './utils/database';
import { logger } from './utils/logger';

export class Server {
  private dlqConsumer: DLQConsumer;

  constructor() {
    const transactionRepository = new TransactionRepository(database);
    const dlqHandler = new DLQHandler(transactionRepository);
    this.dlqConsumer = new DLQConsumer(dlqHandler);
  }

  public async start(): Promise<void> {
    await this.dlqConsumer.start();
    logger.info('DLQ Service started successfully');
  }

  public async stop(): Promise<void> {
    await this.dlqConsumer.stop();
    logger.info('DLQ Service stopped');
  }
}