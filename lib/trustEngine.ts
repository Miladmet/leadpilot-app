import core from './trustEngineCore';

export type TrustStatusLevel = 'Trusted' | 'Verified' | 'Review Required' | 'Low Confidence';

export interface TrustComponent {
  id: string;
  name: string;
  weight: number; // Decimal (e.g. 0.20 for 20%)
  weightPercent: number; // Integer (e.g. 20 for 20%)
  score: number; // 0 - 100
  weightedPoints: number; // score * weight
  status: 'Pass' | 'Optimal' | 'Warning' | 'Alert';
  metricSource: string;
  explanation: string;
}

export interface InvalidComponentDetail {
  name: string;
  value: any;
  reason: string;
}

export interface TrustDiagnostics {
  trustEngineStatus: string;
  trustEngineVersion: string;
  validationStatus: 'VALID' | 'INVALID';
  requiredComponents: string[];
  missingComponents: string[];
  invalidComponents: InvalidComponentDetail[];
  lastSuccessfulCalculation: string | null;
  lastAuditTimestamp: string;
}

export interface TrustScoreResult {
  isAvailable: boolean;
  status: 'VALID' | 'INVALID';
  statusLevel: TrustStatusLevel;
  overallScore: number | null; // null when unavailable
  displayScore: string; // e.g. "96%" or "Trust Score Unavailable"
  reason?: string;
  statusColor: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
  components: {
    databaseSecurity?: TrustComponent;
    verificationEngine?: TrustComponent;
    storageSecurity?: TrustComponent;
    tenantIsolation?: TrustComponent;
    evidenceEngine?: TrustComponent;
    crawlReliability?: TrustComponent;
  };
  componentList: TrustComponent[];
  missingComponents: string[];
  invalidComponents: InvalidComponentDetail[];
  diagnostics: TrustDiagnostics;
  summary: string;
  calculatedAt: string;
}

export interface TrustEngineInput {
  databaseSecurity?: number;
  verificationEngine?: number;
  storageSecurity?: number;
  tenantIsolation?: number;
  evidenceEngine?: number;
  crawlReliability?: number;

  // Canonical metric aliases
  rlsCoveragePercent?: number;
  verificationPassRate?: number;
  storageSecurityScore?: number;
  tenantIsolationPassRate?: number;
  evidenceQuality?: number;
  crawlCoveragePercent?: number;
  findingReliability?: number;
}

export const calculateTrustScore = core.calculateTrustScore as (input?: TrustEngineInput) => TrustScoreResult;
export const getTrustStatusLevel = core.getTrustStatusLevel as (score?: number | null) => TrustStatusLevel;
export const getTrustStatusColors = core.getTrustStatusColors as (status: TrustStatusLevel) => {
  bg: string;
  text: string;
  border: string;
  badge: string;
};
export const REQUIRED_COMPONENTS = core.REQUIRED_COMPONENTS as string[];
export const TRUST_ENGINE_VERSION = core.TRUST_ENGINE_VERSION as string;
