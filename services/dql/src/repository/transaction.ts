import { ITransaction, TransactionStatus } from '@packages/data/contracts/db/transaction';
import { Database } from '@packages/system/db';

export class TransactionRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createTransaction(transaction: ITransaction): Promise<ITransaction> {
    const result = await this.db.insert<ITransaction>('transactions', transaction);
    return result;
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
