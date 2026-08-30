import core from './deploymentVerificationCore';

export interface SchemaHealthBreakdown {
  missingTablesPenalty: number;
  missingColumnsPenalty: number;
  unappliedMigrationsPenalty: number;
  indexMismatchPenalty: number;
  baseScore: number;
}

export interface SchemaHealthData {
  score: number;
  rating: 'EXCELLENT' | 'DEGRADED' | 'CRITICAL';
  status: string;
  migrationStatus: string;
  missingTablesCount: number;
  missingColumnsCount: number;
  lastVerification: string;
  breakdown: SchemaHealthBreakdown;
}

export interface RouteHealthCheck {
  route: string;
  status: 'HEALTHY' | 'FAILED' | 'PENDING';
  latencyMs: number;
  error: string | null;
}

export interface RoutesHealthSummary {
  allPassed: boolean;
  checks: {
    prospectsRoute: RouteHealthCheck;
    dashboardStatsRoute: RouteHealthCheck;
    analyzeRoute: RouteHealthCheck;
  };
}

export interface PlatformSubsystem {
  status: 'Healthy' | 'Degraded';
  label: string;
}

export interface PlatformStatus {
  overall: 'Healthy' | 'Degraded';
  subsystems: {
    trust: PlatformSubsystem;
    security: PlatformSubsystem;
    storage: PlatformSubsystem;
    schema: PlatformSubsystem;
    deployment: PlatformSubsystem;
  };
}

export interface SchemaAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING';
  type: string;
  message: string;
  details: any;
}

export interface DeploymentVerificationResult {
  isDeploymentApproved: boolean;
  timestamp: string;
  schemaHealth: SchemaHealthData;
  databaseDrift: {
    hasDrift: boolean;
    missingItems: any[];
    missingColumns: any[];
    missingTables: string[];
  };
  routesHealth: RoutesHealthSummary;
  platformStatus: PlatformStatus;
  alerts: SchemaAlert[];
  models: any[];
}

export const calculateSchemaHealthScore = core.calculateSchemaHealthScore;
export const generateSchemaAlerts = core.generateSchemaAlerts;
export const getPlatformStatus = core.getPlatformStatus;
export const verifyCoreRoutesHealth = core.verifyCoreRoutesHealth as (prismaClient: any) => Promise<RoutesHealthSummary>;
export const runDeploymentVerification = core.runDeploymentVerification as (prismaClient: any) => Promise<DeploymentVerificationResult>;
