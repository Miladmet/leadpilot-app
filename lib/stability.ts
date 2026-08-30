import core from './stabilityCore';

export interface TimeoutLimits {
  CRAWL_MS: number;
  AI_ANALYSIS_MS: number;
  CRM_SYNC_MS: number;
  PDF_GENERATION_MS: number;
}

export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  operationName?: string;
}

export interface IsolatedResult<T> {
  success: boolean;
  module: string;
  data: T | null;
  error: {
    message: string;
    code: string;
    module: string;
    timestamp: string;
  } | null;
}

export interface CalculationValidation {
  isValid: boolean;
  status: 'Ready' | 'Calculation Unavailable';
  reason: string | null;
}

export interface CRMSyncQueueItem {
  id: string;
  prospectId: string;
  crmType: string;
  payload: any;
  status: 'Sync Pending' | 'Synced' | 'Sync Failed (Max Retries)';
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  lastAttemptAt: string | null;
  lastError: string | null;
}

export const TIMEOUT_LIMITS: TimeoutLimits = core.TIMEOUT_LIMITS;
export const RETRY_CONFIGS = core.RETRY_CONFIGS;

export const withTimeout = core.withTimeout as <T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
  timeoutMs: number,
  operationName?: string
) => Promise<T>;

export const withRetry = core.withRetry as <T>(
  fn: (attempt: number) => Promise<T>,
  options?: Partial<RetryConfig>
) => Promise<T>;

export const isolateModule = core.isolateModule as <T>(
  moduleName: string,
  operationFn: () => Promise<T>,
  fallbackValue?: T | null
) => Promise<IsolatedResult<T>>;

export const validateCalculationInputs = core.validateCalculationInputs as (
  pricingModel: any,
  evidence: any,
  confidence: number
) => CalculationValidation;

export const crmQueue = core.crmQueue;
export const CRMQueueManager = core.CRMQueueManager;
