export interface ErrorSchema {
  statusCode: number;
  message?: string;
}

export interface ErrorMapping {
  [key: string]: ErrorSchema;
}