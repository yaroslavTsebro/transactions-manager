import { IUser } from '@packages/data/contracts/db/user';
import { IDatabase } from '@packages/data/contracts/system/database';

export class UserRepository {
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  async createUser(user: Partial<IUser>): Promise<IUser> {
    const newUser = await this.db.insert<IUser>('users', user);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await this.db
      .select<IUser>('users')
      .where({ email })
      .row()
      .execute();
    return user || null;
  }

  async getUserById(id: string): Promise<IUser | null> {
    const user = await this.db
      .select<IUser>('users')
      .where({ id })
      .row()
      .execute();
    return user || null;
  }

  async updateUserBalance(id: string, balance: bigint): Promise<void> {
    await this.db.update<IUser>('users', { balance }, { id });
  }
}
