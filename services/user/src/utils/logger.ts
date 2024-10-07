import { Logger } from '@packages/system/logger';
import { config } from '../config';

const loggerConfig = {
  level: config.LOG_LEVEL,
  destinations: [
    {
      type: config.LOG_DESTINATION,
      path: config.LOG_PATH,
    },
  ],
};

export const logger = new Logger(loggerConfig);
