import { IEntity } from './entity';

export interface IUser extends IEntity {
  id: string;
  fullName: string;
  balance: BigInt;
  email: string;
}
