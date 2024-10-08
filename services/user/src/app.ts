import { config } from 'dotenv';
import { Server } from './server';
import { logger } from './utils/logger';

const env = process.env.NODE_ENV || 'development';
config({ path: `.env.${env}` });

const server = new Server();

server
  .start()
  .then(() => {
    logger.info('User Service started successfully');
  })
  .catch((error: Error) => {
    logger.error(error, 'Failed to start User Service');
    process.exit(1);
  });
