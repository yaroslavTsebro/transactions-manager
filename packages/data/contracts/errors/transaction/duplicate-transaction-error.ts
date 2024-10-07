export class DuplicateTransactionError extends Error {
  constructor(message = 'Duplicate transaction detected.') {
    super(message);
    this.name = 'DuplicateTransactionError';
  }
}
