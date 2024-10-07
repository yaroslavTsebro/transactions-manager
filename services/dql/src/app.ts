import { Server } from './server';
import { logger } from './utils/logger';

const server = new Server();

server
  .start()
  .then(() => {
    logger.info('DLQ Service is running');
  })
  .catch((error: Error) => {
    logger.error(error, 'Failed to start DLQ Service');
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
