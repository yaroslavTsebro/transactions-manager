import { ITransaction, TransactionStatus } from '@packages/data/contracts/db/transaction';
import { IDatabase } from '@packages/data/contracts/system/database';

export class TransactionRepository {
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  async createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction> {
    const newTransaction = await this.db.insert<ITransaction>('transactions', transaction);
    return newTransaction;
  }

  async getTransactionById(id: string): Promise<ITransaction | null> {
    const transaction = await this.db
      .select<ITransaction>('transactions')
      .where({ id })
      .row()
      .execute();
    return transaction || null;
  }

  async updateTransactionStatus(id: string, status: TransactionStatus): Promise<void> {
    await this.db.update<ITransaction>('transactions', { status }, { id });
  }
}
