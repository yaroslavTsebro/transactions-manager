import { TransactionStatus, ITransaction } from '@packages/data/contracts/db/transaction';
import { TransactionRepository } from '../repository/transaction';
import { logger } from '../utils/logger';


export class DLQHandler {
  private transactionRepository: TransactionRepository;

  constructor(transactionRepository: TransactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  async handleMessage(message: any): Promise<void> {
    try {
      const transactionId = message.transactionId;

      if (!transactionId) {
        logger.error('Transaction ID missing in DLQ message:', message);
        return;
      }

      const transaction = await this.transactionRepository.getTransactionById(transactionId);

      if (transaction) {
        await this.transactionRepository.updateTransactionStatus(transactionId, TransactionStatus.FAILED);
        logger.info(`Transaction ${transactionId} status updated to FAILED.`);
      } else {
        const failedTransaction: ITransaction = {
          id: transactionId,
          senderId: message.userId,
          recipientId: message.recipientId,
          amount: BigInt(message.amount * 100),
          status: TransactionStatus.FAILED,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await this.transactionRepository.createTransaction(failedTransaction);
        logger.info(`Transaction ${transactionId} created with status FAILED.`);
      }
    } catch (error) {
      logger.error(error,'Error handling DLQ message:');
    }
  }
}
