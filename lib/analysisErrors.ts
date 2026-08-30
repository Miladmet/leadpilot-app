import core from './analysisErrorsCore';

export interface AdminErrorDetails {
  prismaErrorCode: string;
  model: string;
  missingItem: string;
  migrationStatus: string;
}

export interface ClassifiedAnalysisError {
  classification: string;
  isRetryable: boolean;
  referenceCode: string;
  userMessage: string;
  adminDetails?: AdminErrorDetails;
  httpStatus: number;
}

export const ANALYSIS_ERROR_CODES = core.ANALYSIS_ERROR_CODES;
export const extractPrismaDetails = core.extractPrismaDetails as (err: any) => AdminErrorDetails;
export const classifyAnalysisError = core.classifyAnalysisError as (err: any) => ClassifiedAnalysisError;
