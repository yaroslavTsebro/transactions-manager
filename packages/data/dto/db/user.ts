import { Entity } from './entity';
import { IUser } from '../../contracts/db/user'

export class User extends Entity implements IUser {
  id: string;
  fullName: string;
  amount: BigInt;
  email: string;
}