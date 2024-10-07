import { Entity } from './entity';
import { IUser } from '../../contracts/db/user'

export class User extends Entity implements IUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  balance: bigint;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    passwordHash: string,
    balance: bigint,
    createdAt: Date,
    updatedAt: Date
  ) {
    super()
    this.id = id;
    this.fullName = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.balance = balance;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}