import { IEntity } from './entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

export interface ITransaction extends IEntity {
  id: string;
  senderId: string;
  recipientId: string;
  amount: BigInt;
  status: TransactionStatus;
}
