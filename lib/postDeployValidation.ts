import core from './postDeployValidationCore';

export interface CriticalModelCheck {
  model: string;
  passed: boolean;
  latencyMs: number;
  recordFound?: boolean;
  error?: string;
}

export interface ApiEndpointCheck {
  route: string;
  passed: boolean;
  latencyMs: number;
  description: string;
  error?: string;
}

export interface DeploymentValidationSummary {
  id: string;
  timestamp: string;
  commitId: string;
  overallHealth: 'HEALTHY' | 'FAILED';
  schemaStatus: 'Healthy' | 'FAILED';
  apiStatus: 'Healthy' | 'FAILED';
  securityStatus: 'Healthy' | 'FAILED';
  trustStatus: 'Healthy' | 'FAILED';
  storageStatus: 'Healthy' | 'FAILED';
  schema: {
    passed: boolean;
    status: string;
    totalModelsVerified: number;
    missingColumnsCount: number;
    missingTablesCount: number;
    criticalMissingColumns: Array<{ model: string; column: string }>;
    criticalMissingTables: string[];
    migrationStatus: string;
    details: any[];
  };
  queries: {
    passed: boolean;
    status: string;
    verifiedCriticalModelsCount: number;
    totalCriticalModels: number;
    checks: CriticalModelCheck[];
  };
  api: {
    passed: boolean;
    status: string;
    verifiedEndpointsCount: number;
    totalEndpoints: number;
    endpoints: ApiEndpointCheck[];
  };
  auth: {
    passed: boolean;
    status: string;
    checks: Array<{ name: string; passed: boolean; error?: string }>;
  };
  trust: {
    passed: boolean;
    status: string;
    trustScore: number;
    statusLevel: string;
    componentsVerified: number;
  };
  security: {
    passed: boolean;
    status: string;
    protectedTablesCount: number;
    totalCustomerTables: number;
    coveragePercent: number;
  };
  storage: {
    passed: boolean;
    status: string;
    totalBuckets: number;
    protectedBuckets: number;
    storageScore: number;
  };
  report: string;
}

export interface DeploymentHistoryRecord {
  id: string;
  timestamp: string;
  commitId: string;
  overallHealth: 'HEALTHY' | 'FAILED';
  schemaStatus: string;
  apiStatus: string;
  securityStatus: string;
  trustStatus: string;
  storageStatus: string;
  missingColumnsCount: number;
  missingTablesCount: number;
}

export const CRITICAL_MODELS = core.CRITICAL_MODELS;
export const validateDatabaseSchema = core.validateDatabaseSchema;
export const validatePrismaQueries = core.validatePrismaQueries;
export const validateApiEndpoints = core.validateApiEndpoints;
export const validateAuthentication = core.validateAuthentication;
export const validateTrustEngine = core.validateTrustEngine;
export const validateRlsSecurity = core.validateRlsSecurity;
export const validateStorageSecurity = core.validateStorageSecurity;
export const generateDeploymentHealthReport = core.generateDeploymentHealthReport;
export const runAutomaticPostDeployValidation = core.runAutomaticPostDeployValidation as (prismaClient: any, options?: any) => Promise<DeploymentValidationSummary>;
export const getDeploymentHistory = core.getDeploymentHistory as () => DeploymentHistoryRecord[];
