import { LoggerDestinationType } from '@packages/data/contracts/system/logger';
import dotenv from 'dotenv';

dotenv.config();

export class Config {
  public readonly DB_USER: string;
  public readonly DB_PASSWORD: string;
  public readonly DB_HOST: string;
  public readonly DB_PORT: number;
  public readonly DB_NAME: string;
  public readonly MQ_URL: string;
  public readonly DLQ_QUEUE: string;
  public readonly LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  public readonly LOG_DESTINATION: LoggerDestinationType;
  public readonly LOG_PATH: string;

  constructor() {
    try {
      this.DB_USER = this.getString('DB_USER');
      this.DB_PASSWORD = this.getString('DB_PASSWORD');
      this.DB_HOST = this.getString('DB_HOST');
      this.DB_PORT = this.getNumber('DB_PORT');
      this.DB_NAME = this.getString('DB_NAME');

      this.MQ_URL = this.getString('MQ_URL');
      this.DLQ_QUEUE = this.getString('DLQ_QUEUE');
      this.LOG_LEVEL = this.getEnum(
        'LOG_LEVEL',
        ['error', 'warn', 'info', 'debug'] as const
      );
      this.LOG_DESTINATION = this.getEnum(
        'LOG_DESTINATION',
        Object.values(LoggerDestinationType) as LoggerDestinationType[]
      );
      this.LOG_PATH = this.getString('LOG_PATH');
    } catch (error) {
      console.error('Configuration Error:', (error as Error).message);
      process.exit(1);
    }
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

  private getString(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
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
