export class AuthorizationError extends Error {
  constructor(message = 'Authorization error.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}