export class UserAlreadyExistsError extends Error {
  constructor(message = 'User with this email already exists.') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}