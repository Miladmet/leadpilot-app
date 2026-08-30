import core from './schemaErrorLoggerCore';

export interface SchemaMismatchLog {
  model: string;
  column: string;
  prismaErrorCode: 'P2021' | 'P2022' | string;
  affectedRoute: string;
  deploymentVersion: string;
  timestamp: string;
  message: string;
}

export const USER_FACING_SCHEMA_ERROR: string = core.USER_FACING_SCHEMA_ERROR;
export const DEPLOYMENT_VERSION: string = core.DEPLOYMENT_VERSION;
export const isSchemaMismatchError = core.isSchemaMismatchError as (err: any) => boolean;
export const parsePrismaSchemaError = core.parsePrismaSchemaError as (err: any, affectedRoute?: string) => SchemaMismatchLog;
