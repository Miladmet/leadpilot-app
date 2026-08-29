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

export interface TrustScoreResult {
  overallScore: number; // 0 - 100
  statusLevel: TrustStatusLevel;
  statusColor: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
  components: {
    databaseSecurity: TrustComponent;
    verificationEngine: TrustComponent;
    storageSecurity: TrustComponent;
    tenantIsolation: TrustComponent;
    evidenceEngine: TrustComponent;
    crawlReliability: TrustComponent;
  };
  componentList: TrustComponent[];
  summary: string;
  calculatedAt: string;
}

export interface TrustEngineInput {
  rlsCoveragePercent?: number;
  storageSecurityScore?: number;
  tenantIsolationPassRate?: number;
  verificationPassRate?: number;
  evidenceQuality?: number;
  crawlCoveragePercent?: number;
  findingReliability?: number;
}

export const calculateTrustScore = core.calculateTrustScore as (input?: TrustEngineInput) => TrustScoreResult;
export const getTrustStatusLevel = core.getTrustStatusLevel as (score: number) => TrustStatusLevel;
export const getTrustStatusColors = core.getTrustStatusColors as (status: TrustStatusLevel) => {
  bg: string;
  text: string;
  border: string;
  badge: string;
};
