import { IEntity } from './entity';

export interface IUser extends IEntity {
  id: string;
  fullName: string;
  balance: bigint;
  password: string;
  email: string;
}
