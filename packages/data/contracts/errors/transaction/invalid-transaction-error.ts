export class InvalidTransactionError extends Error {
  constructor(message = 'Invalid transaction data.') {
    super(message);
    this.name = 'InvalidTransactionError';
  }
}