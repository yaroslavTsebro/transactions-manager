import { AuthenticatedRequest } from '@user/src/middlewares/auth';

export async function parseRequestBody(req: AuthenticatedRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
        resolve();
      } catch (err) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
  });
}