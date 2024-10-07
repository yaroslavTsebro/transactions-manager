import { ErrorMapping } from '@packages/data/contracts/error-handler';
import { ServerResponse } from 'http';

export class ErrorHandler {
  private errorMapping: ErrorMapping;

  constructor(errorMapping: ErrorMapping) {
    this.errorMapping = errorMapping;
  }

  public handleError(res: ServerResponse, error: any): void {
    const errorName = error.name;
    const errorSchema = this.errorMapping[errorName];

    let statusCode = 500;
    let message = 'Internal server error.';

    if (errorSchema) {
      statusCode = errorSchema.statusCode;
      message = errorSchema.message || error.message;
    } else if (error.message === 'Invalid JSON in request body') {
      statusCode = 400;
      message = error.message;
    }

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
}