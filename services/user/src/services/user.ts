import { IUser } from '@packages/data/contracts/db/user';
import { InsufficientFundsError } from '@packages/data/contracts/errors/insufficient-funds-error';
import { InvalidCredentialsError } from '@packages/data/contracts/errors/invalid-credentials-error';
import { RecipientNotFoundError } from '@packages/data/contracts/errors/recipient-not-found-error';
import { UserAlreadyExistsError } from '@packages/data/contracts/errors/user-already-exists-error';
import { UserNotFoundError } from '@packages/data/contracts/errors/user-not-found-error';
import { UserRepository } from '../repositories/user';
import { messageQueue } from '../utils/message-queue';
import { Hasher } from './hasher';
import { JwtService } from './jwt';


export class UserService {
  private userRepository: UserRepository;
  private passwordHasher: Hasher;
  private tokenService: JwtService;

  constructor(
    userRepository: UserRepository,
    passwordHasher: Hasher,
    tokenService: JwtService
  ) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async register(name: string, email: string, password: string): Promise<IUser> {
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user: Partial<IUser> = {
      fullName: name,
      email,
      password: passwordHash,
      balance: BigInt(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUser = await this.userRepository.createUser(user);
    return newUser;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.verify(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.generateToken({ userId: user.id });
    return token;
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async addBalance(userId: string, amount: number): Promise<bigint> {
    const user = await this.getProfile(userId);
    const newBalance = user.balance + BigInt(amount * 100);
    await this.userRepository.updateUserBalance(userId, newBalance);
    return newBalance;
  }

  async transfer(
    userId: string,
    recipientEmail: string,
    amount: number
  ): Promise<bigint> {
    const sender = await this.getProfile(userId);
    const recipient = await this.userRepository.getUserByEmail(recipientEmail);

    if (!recipient) {
      throw new RecipientNotFoundError();
    }

    const transferAmount = BigInt(amount * 100);

    if (sender.balance < transferAmount) {
      throw new InsufficientFundsError();
    }

    const transactionMessage = {
      userId: sender.id,
      recipientId: recipient.id,
      amount: amount,
      currency: 'USD',
    };

    await messageQueue.sendMessage(transactionMessage);

    const newBalance = sender.balance - transferAmount;
    await this.userRepository.updateUserBalance(sender.id, newBalance);

    return newBalance;
  }
}
