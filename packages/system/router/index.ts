import { Handler, Middleware, Route } from '@packages/data/contracts/router';
import { IncomingMessage, ServerResponse } from 'http';

export class Router {
  private routes: Route[] = [];

  public register(
    method: string,
    path: string,
    handler: Handler,
    middleware: Middleware[] = []
  ): void {
    const { regex, keys } = this.pathToRegex(path);
    this.routes.push({ method, path, handler, middleware, regex, keys });
  }

  public async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const method = req.method || '';
    const url = req.url || '';
    const parsedUrl = new URL(url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname || '';

    for (const route of this.routes) {
      if (method === route.method && route.regex.test(pathname)) {
        const matches = pathname.match(route.regex);
        const params: Record<string, string> = {};

        if (matches) {
          route.keys.forEach((key, index) => {
            params[key] = matches[index + 1];
          });
        }

        try {
          for (const mw of route.middleware) {
            await mw(req, res, params);
          }

          await route.handler(req, res, params);
        } catch (error) {
          this.handleError(res, error);
        }
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }

  private handleError(res: ServerResponse, error: any): void {
    let statusCode = 500;
    let message = 'Internal server error.';

    if (error.statusCode && error.message) {
      statusCode = error.statusCode;
      message = error.message;
    }

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }

  private pathToRegex(path: string): { regex: RegExp; keys: string[] } {
    const keys: string[] = [];
    const regexString = path.replace(/:([^\/]+)/g, (_, key) => {
      keys.push(key);
      return '([^\\/]+)';
    });
    const regex = new RegExp(`^${regexString}$`);
    return { regex, keys };
  }
}
