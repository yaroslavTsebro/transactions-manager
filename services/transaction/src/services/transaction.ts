import { ITransaction, TransactionStatus } from '@packages/data/contracts/db/transaction';
import { DuplicateTransactionError } from '@packages/data/contracts/errors/transaction/duplicate-transaction-error';
import { InvalidTransactionError } from '@packages/data/contracts/errors/transaction/invalid-transaction-error';
import { InsufficientFundsError } from '@packages/data/contracts/errors/user/insufficient-funds-error';
import { v4 as uuidv4 } from 'uuid';
import { TransactionRepository } from '../repositories/transaction';
import { database } from '../utils/db';
import { UserNotFoundError } from '@packages/data/contracts/errors/user/user-not-found-error';
import { Database } from '@packages/system/db';
import { User } from '@packages/data/dto/db/user';


export class TransactionService {
  private transactionRepository: TransactionRepository;

  constructor(transactionRepository: TransactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  async processTransaction(message: any): Promise<void> {

    if (!this.validateMessage(message)) {
      throw new InvalidTransactionError();
    }

    const { transactionId, userId, recipientId, amount, currency } = message;

    const existingTransaction = await this.transactionRepository.getTransactionById(transactionId);
    if (existingTransaction) {
      throw new DuplicateTransactionError();
    }

    await database.transaction(async (trxDb: Database) => {
      const sender = await trxDb
        .select<any>('users')
        .where({ id: userId })
        .row()
        .execute();

      const recipient = await trxDb
        .select<any>('users')
        .where({ id: recipientId })
        .row()
        .execute();

      if (!sender) {
        throw new UserNotFoundError('Sender not found.');
      }
      if (!recipient) {
        throw new UserNotFoundError('Recipient not found.');
      }

      const transferAmount = BigInt(amount * 100);

      if (BigInt(sender.balance) < transferAmount) {
        throw new InsufficientFundsError();
      }

      await trxDb.update('users', { balance: BigInt(sender.balance) - transferAmount } as User, { id: userId });

      await trxDb.update('users', { balance: BigInt(recipient.balance) + transferAmount } as User, { id: recipientId });

      const transaction: ITransaction = {
        id: transactionId || uuidv4(),
        senderId: userId,
        recipientId: recipientId,
        amount: transferAmount,
        status: TransactionStatus.SUCCESS,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.transactionRepository.createTransaction(transaction);
    });
  }

  private validateMessage(message: any): boolean {
    return (
      message &&
      typeof message.transactionId === 'string' &&
      typeof message.userId === 'string' &&
      typeof message.recipientId === 'string' &&
      typeof message.amount === 'number' &&
      typeof message.currency === 'string'
    );
  }
}