import core from './authDiagnosticsCore';

export type AuthFailureClassification = 
  | 'USER_NOT_FOUND'
  | 'INVALID_PASSWORD'
  | 'ACCOUNT_DISABLED'
  | 'EMAIL_NOT_VERIFIED'
  | 'AUTH_PROVIDER_ERROR'
  | 'DATABASE_CONNECTION_ERROR';

export interface InternalAuthFailureLog {
  classification: AuthFailureClassification;
  userExists: boolean;
  authProviderReachable: boolean;
  databaseConnected: boolean;
  timestamp: string;
}

export interface DevDiagnosticsData {
  classification: AuthFailureClassification;
  environment: 'Development';
  database: 'Connected' | 'Disconnected';
  authService: 'Reachable' | 'Unreachable';
  userRecord: 'Found' | 'Not Found';
  timestamp: string;
}

export const AUTH_FAILURE_TYPES = core.AUTH_FAILURE_TYPES;
export const classifyLoginFailure = core.classifyLoginFailure as (params: {
  user: any;
  passwordMatches?: boolean;
  isDbConnected?: boolean;
  isAuthServiceReachable?: boolean;
  dbError?: any;
  authError?: any;
}) => InternalAuthFailureLog;

export const formatDevDiagnostics = core.formatDevDiagnostics as (diag: InternalAuthFailureLog) => DevDiagnosticsData;
