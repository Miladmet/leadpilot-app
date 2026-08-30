import core from './schemaVerificationCore';
import prisma from './prisma';

export interface ModelVerificationReport {
  modelName: string;
  tableName: string;
  tableExists: boolean;
  allColumnsPresent: boolean;
  missingColumns: string[];
  existingColumns: string[];
  status: 'HEALTHY' | 'MISSING_COLUMNS' | 'MISSING_TABLE';
}

export interface SchemaVerificationResult {
  isHealthy: boolean;
  schemaStatus: 'Healthy' | 'Drift Detected';
  migrationStatus: 'Up To Date' | 'Pending Migration';
  lastVerification: string;
  totalModelsChecked: number;
  missingItemsCount: number;
  missingTablesCount: number;
  missingColumnsCount: number;
  missingTables: string[];
  missingColumns: string[];
  missingItems: Array<{ model: string; type: 'TABLE' | 'COLUMN'; name: string }>;
  models: ModelVerificationReport[];
  reportText: string;
  driftBlockedText: string | null;
}

export async function runSchemaVerification(): Promise<SchemaVerificationResult> {
  return await core.verifyDatabaseSchema(prisma);
}

export const EXPECTED_MODELS = core.EXPECTED_MODELS;
export const formatDriftBlockedReport = core.formatDriftBlockedReport;
