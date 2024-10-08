import { config } from 'dotenv';
import { Server } from './server';
import { logger } from './utils/logger';

const env = process.env.NODE_ENV || 'development';
config({ path: `.env.${env}` });

const server = new Server();

server
  .start()
  .then(() => {
    logger.info('Transaction Service is running');
  })
  .catch((error: Error) => {
    logger.error(error, 'Failed to start Transaction Service');
    process.exit(1);
  });

process.on('SIGTERM', async () => {
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await server.stop();
  process.exit(0);
});