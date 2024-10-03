export enum LoggerDestinationType {
  CONSOLE = 'CONSOLE',
  FILE = 'FILE',
}

export interface ILoggerDestination {
  type: LoggerDestinationType;
  path?: string;
}

export interface ILoggerConfigs {
  level: 'error' | 'warn' | 'info' | 'debug';
  destinations: ILoggerDestination[];
}

export interface ILoggerFunc {
  <T extends object>(obj: T, msg?: string): void;
  (obj: unknown, msg?: string): void;
  (msg: string): void;
}


export interface ILogger {
  error: ILoggerFunc;
  warn: ILoggerFunc;
  info: ILoggerFunc;
  debug: ILoggerFunc;
}