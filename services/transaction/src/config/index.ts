import dotenv from 'dotenv';
import { LoggerDestinationType } from '@packages/data/contracts/system/logger';

dotenv.config();

export class Config {
  public readonly DB_USER: string;
  public readonly DB_PASSWORD: string;
  public readonly DB_HOST: string;
  public readonly DB_PORT: number;
  public readonly DB_NAME: string;

  public readonly LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  public readonly LOG_DESTINATION: LoggerDestinationType;
  public readonly LOG_PATH: string;

  public readonly MQ_URL: string;
  public readonly MQ_QUEUE: string;
  public readonly MAX_RETRIES: number;
  public readonly DLX_EXCHANGE: string;
  public readonly DLQ_QUEUE: string;

  public readonly PORT: number;

  constructor() {
    try {
      this.DB_USER = this.getString('DB_USER');
      this.DB_PASSWORD = this.getString('DB_PASSWORD');
      this.DB_HOST = this.getString('DB_HOST');
      this.DB_PORT = this.getNumber('DB_PORT');
      this.DB_NAME = this.getString('DB_NAME');

      this.LOG_LEVEL = this.getEnum(
        'LOG_LEVEL',
        ['error', 'warn', 'info', 'debug'] as const
      );
      this.LOG_DESTINATION = this.getEnum(
        'LOG_DESTINATION',
        Object.values(LoggerDestinationType) as LoggerDestinationType[]
      );
      this.LOG_PATH = this.getString('LOG_PATH');

      this.MQ_URL = this.getString('MQ_URL');
      this.MQ_QUEUE = this.getString('MQ_QUEUE');
      this.MAX_RETRIES = this.getNumber('MAX_RETRIES')
      
      this.DLX_EXCHANGE = this.getString('DLX_EXCHANGE')
      this.DLQ_QUEUE = this.getString('DLQ_QUEUE')

      this.PORT = this.getNumber('PORT');
    } catch (error) {
      console.error('Configuration Error:', (error as Error).message);
      process.exit(1);
    }
  }

  private getString(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
  }

  private getNumber(key: string): number {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
      throw new Error(`Environment variable ${key} must be a number`);
    }
    return numberValue;
  }

  private getEnum<T extends string>(
    key: string,
    validValues: readonly T[]
  ): T {
    const value = process.env[key];
    if (!value || !validValues.includes(value as T)) {
      throw new Error(
        `Environment variable ${key} must be one of: ${validValues.join(', ')}`
      );
    }
    return value as T;
  }
}

export const config = new Config();
