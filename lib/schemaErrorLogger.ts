import core from './schemaErrorLoggerCore';

export interface SchemaMismatchLog {
  model: string;
  column: string;
  prismaErrorCode: 'P2021' | 'P2022' | string;
  route: string;
  timestamp: string;
  message: string;
}

export const USER_FACING_SCHEMA_ERROR: string = core.USER_FACING_SCHEMA_ERROR;
export const isSchemaMismatchError = core.isSchemaMismatchError as (err: any) => boolean;
export const parsePrismaSchemaError = core.parsePrismaSchemaError as (err: any, route?: string) => SchemaMismatchLog;
