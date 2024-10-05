export interface IDatabaseConfig {
  max?: number | undefined;
  min?: number | undefined;
  user?: string | undefined;
  database?: string | undefined;
  password?: string | undefined;
  port?: number | undefined;
  host?: string | undefined;
}

export interface CountResult {
  count: string;
}

export enum ComparisonOperator {
  GREATER_THAN_OR_EQUALS = '>=',
  LESS_THAN_OR_EQUALS = '<=',
  NOT_EQUALS = '<>',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  EQUALS = '='
}

export enum PatternOperator {
  ANY_CHARACTERS = '*',
  SINGLE_CHARACTER = '?'
}

export const Operator = {
  ...ComparisonOperator,
  ...PatternOperator
} as const;

export type Operator = ComparisonOperator | PatternOperator;

export interface ConditionResult {
  clause: string;
  value: any;
}

export enum ResultMode {
  ROWS = 0,
  ROW = 1,
  VALUE = 2,
  COL = 3,
  COUNT = 4,
}

export interface ICursor<T> {
  fields(fields: (keyof T)[]): ICursor<T>;
  where(where: Partial<Record<keyof T, any>>): ICursor<T>;
  order(cols: (keyof T)[]): ICursor<T>;
  value(): ICursor<T>;
  row(): ICursor<T>;
  col<K extends keyof T>(name: K): ICursor<T>;
  count(): ICursor<T>;
  execute(): Promise<any>;
}

export interface IDatabase {
  query<T>(text: string, params?: any[]): Promise<IQueryResult<T>>;
  select<T>(table: string): ICursor<T>;
  insert<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, data: Partial<T>, where: Partial<Record<keyof T, any>>): Promise<T>;
  delete<T>(table: string, where: Partial<Record<keyof T, any>>): Promise<T>;
}

export interface IQueryResult<T> {
  rows: T[];
  rowCount: number | null;
}