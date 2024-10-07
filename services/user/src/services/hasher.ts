import argon2 from 'argon2';

export class Hasher {
  async hash(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
}
