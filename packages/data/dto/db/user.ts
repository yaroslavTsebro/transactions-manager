import { Entity } from './entity';
import { IUser } from '../../contracts/db/user'

export class User extends Entity implements IUser {
  id: string;
  fullName: string;
  email: string;
  balance: bigint;
  createdAt: Date;
  password: string;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    balance: bigint,
    createdAt: Date,
    updatedAt: Date
  ) {
    super()
    this.id = id;
    this.fullName = name;
    this.email = email;
    this.password = password;
    this.balance = balance;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}