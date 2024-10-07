import { ComparisonOperator, ConditionResult, CountResult, ICursor, IDatabase, IDatabaseConfig, IQueryResult, Operator, PatternOperator, ResultMode } from '@packages/data/contracts/system/database';
import { ILogger } from '@packages/data/contracts/system/logger';
import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';

const DefaultLogger: ILogger = {
  error: (objOrMsg: unknown, msg?: string): void => {
    if (typeof objOrMsg === 'string') {
      console.error(objOrMsg);
    } else if (msg) {
      console.error(msg, objOrMsg);
    } else {
      console.error(objOrMsg);
    }
  },
  warn: (objOrMsg: unknown, msg?: string): void => {
    if (typeof objOrMsg === 'string') {
      console.warn(objOrMsg);
    } else if (msg) {
      console.warn(msg, objOrMsg);
    } else {
      console.warn(objOrMsg);
    }
  },
  info: (objOrMsg: unknown, msg?: string): void => {
    if (typeof objOrMsg === 'string') {
      console.log(objOrMsg);
    } else if (msg) {
      console.log(msg, objOrMsg);
    } else {
      console.log(objOrMsg);
    }
  },
  debug: (objOrMsg: unknown, msg?: string): void => {
    if (typeof objOrMsg === 'string') {
      console.debug(objOrMsg);
    } else if (msg) {
      console.debug(msg, objOrMsg);
    } else {
      console.debug(objOrMsg);
    }
  },
};

export class Database implements IDatabase {
  private pool: Pool;
  private client?: PoolClient;
  public logger: ILogger;

  constructor(config: IDatabaseConfig, logger?: ILogger, client?: PoolClient) {
    const poolConfig: PoolConfig = { ...config };
    this.pool = new Pool(poolConfig);
    this.logger = logger || DefaultLogger;
    this.client = client; // Assign client if provided (for transactions)
  }

  async query<T>(text: string, params?: any[]): Promise<IQueryResult<T>> {
    try {
      this.logger.info(`Executing query: ${text} with params: ${JSON.stringify(params)}`);
      const res: QueryResult<any> = this.client
        ? await this.client.query(text, params)
        : await this.pool.query(text, params);
      const result: IQueryResult<T> = {
        rows: res.rows as T[],
        rowCount: res.rowCount,
      };
      return result;
    } catch (err) {
      this.logger.error(err, 'Database query error');
      throw err;
    }
  }

  select<T>(table: string): ICursor<T> {
    return new Cursor<T>(table, this, this.logger);
  }

  async insert<T>(table: string, data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const params = keys.map((_, idx) => `$${idx + 1}`).join(', ');

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${params}) RETURNING *`;
    try {
      this.logger.info(`Executing insert: ${query} with values: ${JSON.stringify(values)}`);
      const result = await this.query<T>(query, values);
      return result.rows[0];
    } catch (error) {
      this.logger.error(error, 'Database insert error');
      throw error;
    }
  }

  async update<T>(table: string, data: Partial<T>, where: Partial<Record<keyof T, any>>): Promise<T> {
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      setClauses.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }

    const cursor = new Cursor<T>(table, this, this.logger);
    const { clause, args } = cursor['resolveWhereClause'](where);

    const whereClauseWithParams = clause.replace(/\$\d+/g, () => {
      const paramIndex = idx++;
      return `$${paramIndex}`;
    });

    const query = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereClauseWithParams} RETURNING *`;
    values.push(...args);

    try {
      this.logger.info(`Executing update: ${query} with values: ${JSON.stringify(values)}`);
      const result = await this.query<T>(query, values);
      return result.rows[0];
    } catch (error) {
      this.logger.error(error, 'Database update error');
      throw error;
    }
  }

  async delete<T>(table: string, where: Partial<Record<keyof T, any>>): Promise<T> {
    const cursor = new Cursor<T>(table, this, this.logger);
    const { clause, args } = cursor['resolveWhereClause'](where);

    const query = `DELETE FROM ${table} WHERE ${clause} RETURNING *`;
    try {
      this.logger.info(`Executing delete: ${query} with params: ${JSON.stringify(args)}`);
      const result = await this.query<T>(query, args);
      return result.rows[0];
    } catch (error) {
      this.logger.error(error, 'Database delete error');
      throw error;
    }
  }

  async transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const transactionalDb = new Database({}, this.logger, client);
      const result = await callback(transactionalDb);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(error, 'Transaction rolled back due to error:');
      throw error;
    } finally {
      client.release();
    }
  }
}

export class Cursor<T> implements ICursor<T> {
  private table: string;
  private columns: string[] = ['*'];
  private counter: number = 1;
  private orderColumns: string[] = [];
  private mode: ResultMode = ResultMode.ROWS;
  private columnName: string = '';
  private whereClause: string = '';
  private args: any[] = [];
  private db: Database;
  private logger: ILogger;
  private lockMode: string | null = null;

  constructor(table: string, db: Database, logger?: ILogger) {
    this.table = table;
    this.db = db;
    this.logger = logger || DefaultLogger;
  }

  fields(fields: (keyof T)[]): ICursor<T> {
    this.columns = fields as string[];
    return this;
  }

  forUpdate(): ICursor<T> {
    this.lockMode = 'FOR UPDATE';
    return this;
  }

  private getConditionResolver(operator: Operator) {
    const conditionResolvers = new Map<Operator, (key: string, i: number, value: any) => ConditionResult>([
      [ComparisonOperator.GREATER_THAN, (key, i, value) => ({ clause: `${key} > $${i}`, value })],
      [ComparisonOperator.NOT_EQUALS, (key, i, value) => ({ clause: `${key} <> $${i}`, value })],
      [ComparisonOperator.EQUALS, (key, i, value) => ({ clause: `${key} = $${i}`, value })],
      [ComparisonOperator.LESS_THAN, (key, i, value) => ({ clause: `${key} < $${i}`, value })],
      [ComparisonOperator.GREATER_THAN_OR_EQUALS, (key, i, value) => ({ clause: `${key} >= $${i}`, value })],
      [ComparisonOperator.LESS_THAN_OR_EQUALS, (key, i, value) => ({ clause: `${key} <= $${i}`, value })],
      [PatternOperator.ANY_CHARACTERS, (key, i, value) => ({
        clause: `${key} LIKE $${i}`,
        value: value.replace(/\*/g, '%').replace(/\?/g, '_')
      })],
      [PatternOperator.SINGLE_CHARACTER, (key, i, value) => ({
        clause: `${key} LIKE $${i}`,
        value: value.replace(/\*/g, '%').replace(/\?/g, '_')
      })]
    ]);

    return conditionResolvers.get(operator);
  }

  private resolveWhereClause(where: Partial<Record<keyof T, any>>) {
    const args: any[] = [];
    let clause = '';

    for (const [key, rawValue] of Object.entries(where)) {
      let value = rawValue;
      let resolver = this.getConditionResolver(ComparisonOperator.EQUALS);

      if (typeof value === 'string') {
        if (value.startsWith('>=')) {
          resolver = this.getConditionResolver(ComparisonOperator.GREATER_THAN_OR_EQUALS);
          value = value.substring(2);
        } else if (value.startsWith('<=')) {
          resolver = this.getConditionResolver(ComparisonOperator.LESS_THAN_OR_EQUALS);
          value = value.substring(2);
        } else if (value.startsWith('<>')) {
          resolver = this.getConditionResolver(ComparisonOperator.NOT_EQUALS);
          value = value.substring(2);
        } else if (value.startsWith('>')) {
          resolver = this.getConditionResolver(ComparisonOperator.GREATER_THAN);
          value = value.substring(1);
        } else if (value.startsWith('<')) {
          resolver = this.getConditionResolver(ComparisonOperator.LESS_THAN);
          value = value.substring(1);
        } else if (value.includes('*') || value.includes('?')) {
          resolver = this.getConditionResolver(PatternOperator.ANY_CHARACTERS);
        }
      }

      if (resolver) {
        const { clause: resolvedClause, value: processedValue } = resolver(key, this.counter, value);
        clause = clause ? `${clause} AND ${resolvedClause}` : resolvedClause;
        args.push(processedValue);
        this.counter++;
      }
    }

    return { clause, args };
  }

  where(where: Partial<Record<keyof T, any>>): ICursor<T> {
    const { clause, args } = this.resolveWhereClause(where);
    this.whereClause = clause;
    this.args = args;
    return this;
  }

  order(cols: (keyof T)[]): ICursor<T> {
    this.orderColumns = cols as string[];
    return this;
  }

  value(): ICursor<T> {
    this.mode = ResultMode.VALUE;
    return this;
  }

  row(): ICursor<T> {
    this.mode = ResultMode.ROW;
    return this;
  }

  col<K extends keyof T>(name: K): ICursor<T> {
    this.mode = ResultMode.COL;
    this.columnName = name as string;
    return this;
  }

  count(): ICursor<T> {
    this.mode = ResultMode.COUNT;
    return this;
  }

  async execute(): Promise<any> {
    let query = 'SELECT ';

    if (this.mode === ResultMode.COUNT) {
      query += 'COUNT(*)';
    } else {
      query += this.columns.join(', ');
    }

    query += ` FROM ${this.table}`;

    if (this.whereClause) {
      query += ` WHERE ${this.whereClause}`;
    }

    if (this.orderColumns.length > 0) {
      query += ` ORDER BY ${this.orderColumns.join(', ')}`;
    }

    if (this.lockMode) {
      query += ` ${this.lockMode}`;
    }

    try {
      this.logger.info(`Executing query: ${query} with params: ${JSON.stringify(this.args)}`);

      if (this.mode === ResultMode.COUNT) {
        const result = await this.db.query<CountResult>(query, this.args);
        return parseInt(result.rows[0].count, 10);
      } else {
        const result = await this.db.query<T>(query, this.args);

        switch (this.mode) {
          case ResultMode.VALUE:
            return result.rows[0][this.columns[0] as keyof T];
          case ResultMode.ROW:
            return result.rows[0];
          case ResultMode.COL:
            return result.rows.map(row => row[this.columnName as keyof T]);
          case ResultMode.ROWS:
          default:
            return result.rows;
        }
      }
    } catch (error) {
      this.logger.error(error, 'Cursor execute error');
      throw error;
    }
  }
}