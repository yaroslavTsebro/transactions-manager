import { ITransaction, TransactionStatus } from '../../contracts/db/transaction';
import { Entity } from './entity';

export class Transaction extends Entity implements ITransaction {
  id: string;
  senderId: string;
  recipientId: string;
  amount: BigInt;
  status: TransactionStatus;
}