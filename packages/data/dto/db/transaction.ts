import { ITransaction, TransactionStatus } from '../../contracts/db/transaction';
import { Entity } from './entity';

export class Transaction extends Entity implements ITransaction {
  id: string;
  senderId: string;
  recipientId: string;
  amount: bigint;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    senderId: string,
    recipientId: string,
    amount: bigint,
    status: TransactionStatus,
    createdAt: Date,
    updatedAt: Date

  ) {
    super();
    this.id = id;
    this.senderId = senderId;
    this.recipientId = recipientId;
    this.amount = amount;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}