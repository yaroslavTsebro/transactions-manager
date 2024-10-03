import { ILogger, ILoggerConfigs, ILoggerDestination, LoggerDestinationType } from '@packages/data/contracts/system/logger';
import { pino, Logger as PinoLogger } from 'pino';
import { multistream } from 'pino-multi-stream';

export class Logger implements ILogger {
  private logger: PinoLogger;

  private destinationHandlers = {
    [LoggerDestinationType.FILE]: () => ({ stream: pino.destination({ dest: './logs.log', sync: false }) }),
    [LoggerDestinationType.CONSOLE]: () => ({
      stream: pino.transport({
        target: 'pino-pretty',
        options: { colorize: true }
      }).stream
    })
  };

  private prepareDestination(destination: ILoggerDestination) {
    const prepareFn = this.destinationHandlers[destination.type];

    if (!prepareFn) throw new Error(`Unknown destination type: ${destination.type}`);

    return prepareFn();
  }

  constructor(configs: ILoggerConfigs) {
    const destinations = configs.destinations.map(destination => this.prepareDestination(destination));
    const streams = multistream(destinations);

    this.logger = pino({ level: configs.level }, streams);
  }

  error<T extends object>(obj: T, msg?: string): void;
  error(obj: unknown, msg?: string): void;
  error(msg: string): void;
  error(msgOrObj: unknown, msg?: string): void {
    if (typeof msgOrObj === 'string') {
      this.logger.error(msgOrObj);
    } else {
      this.logger.error(msgOrObj, msg || '');
    }
  }

  warn<T extends object>(obj: T, msg?: string): void;
  warn(obj: unknown, msg?: string): void;
  warn(msg: string): void;
  warn(msgOrObj: unknown, msg?: string): void {
    if (typeof msgOrObj === 'string') {
      this.logger.warn(msgOrObj);
    } else {
      this.logger.warn(msgOrObj, msg || '');
    }
  }

  info<T extends object>(obj: T, msg?: string): void;
  info(obj: unknown, msg?: string): void;
  info(msg: string): void;
  info(msgOrObj: unknown, msg?: string): void {
    if (typeof msgOrObj === 'string') {
      this.logger.info(msgOrObj);
    } else {
      this.logger.info(msgOrObj, msg || '');
    }
  }

  debug<T extends object>(obj: T, msg?: string): void;
  debug(obj: unknown, msg?: string): void;
  debug(msg: string): void;
  debug(msgOrObj: unknown, msg?: string): void {
    if (typeof msgOrObj === 'string') {
      this.logger.debug(msgOrObj);
    } else {
      this.logger.debug(msgOrObj, msg || '');
    }
  }
}
