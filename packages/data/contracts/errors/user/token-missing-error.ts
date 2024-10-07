export class TokenMissingError extends Error {
  constructor(message = 'Token missing.') {
    super(message);
    this.name = 'TokenMissingError';
  }
}