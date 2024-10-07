import { Database } from '@packages/system/db';
import { config } from '../config';
import { logger } from './logger';
import { IDatabaseConfig } from '@packages/data/contracts/system/database';

const dbConfig: IDatabaseConfig = {
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT,
};

export const database = new Database(dbConfig, logger);
