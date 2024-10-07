import { ILogger } from '@packages/data/contracts/system/logger';
import { ServerResponse } from 'http';
import { AuthenticatedRequest } from '../middlewares/auth';
import { UserService } from '../services/user';
import { ErrorMapping } from '@packages/data/contracts/error-handler';
import { ErrorHandler } from '@packages/system/error-handler';
import { parseRequestBody } from '@packages/system/parse-body';

export class UserController {
  private userService: UserService;
  private logger: ILogger;
  private errorHandler: ErrorHandler;

  constructor(userService: UserService, logger: ILogger) {
    this.userService = userService;
    this.logger = logger;
    this.errorHandler = new ErrorHandler(this.getErrorMapping());
  }

  public async register(
    req: AuthenticatedRequest,
    res: ServerResponse
  ): Promise<void> {
    try {
      await parseRequestBody(req);
      const { name, email, password } = req.body;
      const user = await this.userService.register(name, email, password);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          balance: (user.balance / BigInt(100)).toString(),
        })
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public async login(
    req: AuthenticatedRequest,
    res: ServerResponse
  ): Promise<void> {
    try {
      await parseRequestBody(req);
      const { email, password } = req.body;
      const token = await this.userService.login(email, password);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token }));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public async getProfile(
    req: AuthenticatedRequest,
    res: ServerResponse
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const user = await this.userService.getProfile(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          balance: (user.balance / BigInt(100)).toString(),
        })
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public async addBalance(
    req: AuthenticatedRequest,
    res: ServerResponse
  ): Promise<void> {
    try {
      await parseRequestBody(req);
      const userId = req.userId!;
      const { amount } = req.body;
      const newBalance = await this.userService.addBalance(userId, amount);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message: 'Balance updated',
          newBalance: (newBalance / BigInt(100)).toString(),
        })
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public async transfer(
    req: AuthenticatedRequest,
    res: ServerResponse
  ): Promise<void> {
    try {
      await parseRequestBody(req);
      const userId = req.userId!;
      const { recipientEmail, amount } = req.body;
      const newBalance = await this.userService.transfer(
        userId,
        recipientEmail,
        amount
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message: 'Transfer initiated',
          newBalance: (newBalance / BigInt(100)).toString(),
        })
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: ServerResponse, error: any): void {
    this.logger.error(error);
    this.errorHandler.handleError(res, error);
  }

  private getErrorMapping(): ErrorMapping {
    return {
      UserAlreadyExistsError: { statusCode: 400 },
      InvalidCredentialsError: { statusCode: 400 },
      UserNotFoundError: { statusCode: 404 },
      RecipientNotFoundError: { statusCode: 404 },
      InsufficientFundsError: { statusCode: 400 },
      AuthorizationError: { statusCode: 401 },
      TokenMissingError: { statusCode: 401 },
      InvalidTokenError: { statusCode: 401 },
    };
  }
}