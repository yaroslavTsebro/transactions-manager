export class InsufficientFundsError extends Error {
  constructor(message = 'Insufficient funds.') {
    super(message);
    this.name = 'InsufficientFundsError';
  }
}