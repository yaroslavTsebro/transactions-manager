import { AuthorizationError } from '@packages/data/contracts/errors/authorization-error';
import { TokenMissingError } from '@packages/data/contracts/errors/token-missing-error';
import { IncomingMessage, ServerResponse } from 'http';
import { InvalidTokenError } from '@packages/data/contracts/errors/invalid-token-error';
import { JwtService } from '../services/jwt';

export interface AuthenticatedRequest extends IncomingMessage {
  userId?: string;
  body?: any;
}

export const authMiddleware = (tokenService: JwtService) => {
  return async (
    req: AuthenticatedRequest,
    res: ServerResponse,
    params?: Record<string, string>
  ): Promise<void> => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new AuthorizationError('Authorization header missing.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new TokenMissingError('Token missing.');
    }

    try {
      const decoded = tokenService.verifyToken(token) as { userId: string };
      req.userId = decoded.userId;
    } catch (err) {
      throw new InvalidTokenError('Invalid token.');
    }
  };
};
