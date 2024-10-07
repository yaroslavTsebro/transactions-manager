export class TransactionNotFoundError extends Error {
  constructor(message = 'Transaction not found.') {
    super(message);
    this.name = 'TransactionNotFoundError';
  }
}