import { TransactionConsumer } from './consumers/transaction';
import { TransactionRepository } from './repositories/transaction';
import { TransactionService } from './services/transaction';
import { database } from './utils/db';
import { logger } from './utils/logger';

export class Server {
  private transactionConsumer: TransactionConsumer;

  constructor() {
    const transactionRepository = new TransactionRepository(database);
    const transactionService = new TransactionService(transactionRepository);
    this.transactionConsumer = new TransactionConsumer(transactionService);
  }

  public async start(): Promise<void> {
    await this.transactionConsumer.start();
    logger.info('Transaction Service started successfully');
  }

  public async stop(): Promise<void> {
    await this.transactionConsumer.stop();
    logger.info('Transaction Service stopped');
  }
}