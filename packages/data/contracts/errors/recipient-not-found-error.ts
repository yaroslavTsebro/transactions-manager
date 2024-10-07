export class RecipientNotFoundError extends Error {
  constructor(message = 'Recipient not found.') {
    super(message);
    this.name = 'RecipientNotFoundError';
  }
}