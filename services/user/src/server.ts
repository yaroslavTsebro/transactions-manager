import { Router } from '@packages/system/router';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { authMiddleware } from './middlewares/auth';
import { UserRepository } from './repositories/user';
import { UserService } from './services/user';
import { logger } from './utils/logger';
import { config } from './config';
import { database } from './utils/db';
import { messageQueue } from './utils/message-queue';
import { JwtService } from './services/jwt';
import { Hasher } from './services/hasher';
import { UserController } from './controller/user';

export class Server {
  private userController: UserController;
  private router: Router;
  private tokenService: JwtService;

  constructor() {
    const userRepository = new UserRepository(database);
    const hasher = new Hasher();
    this.tokenService = new JwtService(config.JWT_SECRET);
    const userService = new UserService(
      userRepository,
      hasher,
      this.tokenService
    );
    this.userController = new UserController(userService, logger);
    this.router = new Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    
    this.router.register('POST', '/users/register', (req, res) =>
      this.userController.register(req as any, res)
    );
    this.router.register('POST', '/users/login', (req, res) =>
      this.userController.login(req as any, res)
    );

    
    const auth = authMiddleware(this.tokenService);

    this.router.register(
      'GET',
      '/users/profile',
      (req, res) => this.userController.getProfile(req as any, res),
      [auth]
    );
    this.router.register(
      'POST',
      '/users/balance/add',
      (req, res) => this.userController.addBalance(req as any, res),
      [auth]
    );
    this.router.register(
      'POST',
      '/users/transfer',
      (req, res) => this.userController.transfer(req as any, res),
      [auth]
    );
  }

  public async start(): Promise<void> {
    await this.connectMessageQueue();

    const server = createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        this.router.handleRequest(req, res);
      }
    );

    server.listen(config.PORT, () => {
      logger.info(`User Service is running on port ${config.PORT}`);
    });
  }

  private async connectMessageQueue(): Promise<void> {
    try {
      await messageQueue.connect();
      logger.info('Connected to Message Queue');
    } catch (error) {
      logger.error(error, 'Failed to connect to Message Queue');
      process.exit(1);
    }
  }
}