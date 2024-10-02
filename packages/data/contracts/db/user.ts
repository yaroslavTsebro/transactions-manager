import { IEntity } from './entity';

export interface IUser extends IEntity {
  id: string;
  fullName: string;
  amount: BigInt;
  email: string;
}
