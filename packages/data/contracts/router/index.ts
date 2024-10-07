import { IncomingMessage, ServerResponse } from 'node:http';

export type Handler = (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>) => Promise<void> | void;

export interface Route {
  method: string;
  path: string;
  handler: Handler;
  middleware: Middleware[];
  regex: RegExp;
  keys: string[];
}

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  params?: Record<string, string>
) => Promise<void> | void;