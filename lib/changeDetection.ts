/**
 * TypeScript wrapper and types for LeadPilot Analysis Change Detection & Explanation Engine
 */

// Import from CommonJS core
// @ts-ignore
import * as changeDetectionCore from './changeDetectionCore';

export interface AnalysisDifferenceSummary {
  title: string;
  verifiedFacts: string;
  crawlCoverage: string;
  pagesCrawled: string;
  opportunityValue: string;
  trustScore: string;
  status: string;
}

export interface RootCauseClassification {
  primaryCause: string;
  impact: string;
  allowedReasons: string[];
}

export interface WebsiteChangesDetection {
  detected: boolean;
  currentAnalysisDate: string;
  previousAnalysisDate: string;
  newContentFound: string[];
  impactStatement: string;
}

export interface PricingModelDifference {
  changed: boolean;
  previousModel: string;
  currentModel: string;
  explanation: string;
}

export interface TrustScoreDifference {
  changed: boolean;
  displayDelta: string;
  reasons: string[];
}

export interface AnalysisComparisonReport {
  isRepeatedAnalysis: boolean;
  version: number;
  totalVersions: number;
  message?: string;
  previousAnalysis?: {
    id: string;
    timestamp: string | Date;
    timeAgo: string;
    shortDate: string;
    pagesCrawled: number;
    crawlCoverage: string;
    factsCount: number;
    opportunityRange: string;
    trustScore: string;
    pricingModel: string;
  };
  currentAnalysis?: {
    id: string;
    timestamp: string | Date;
    shortDate: string;
    pagesCrawled: number;
    crawlCoverage: string;
    factsCount: number;
    opportunityRange: string;
    trustScore: string;
    pricingModel: string;
  };
  summaryCard?: AnalysisDifferenceSummary;
  explanation?: string;
  rootCause?: RootCauseClassification;
  websiteChanges?: WebsiteChangesDetection;
  pricingModelChanges?: PricingModelDifference;
  trustScoreChanges?: TrustScoreDifference;
  itemizedDeltas?: {
    newlyVerifiedFacts: string[];
    newlyIdentifiedOpportunities: string[];
    newPagesCrawled: string[];
  };
}

export const ALLOWED_ROOT_CAUSES: string[] = changeDetectionCore.ALLOWED_ROOT_CAUSES;
export const normalizeWebsiteUrl: (url: string) => string = changeDetectionCore.normalizeWebsiteUrl;
export const detectAnalysisChanges: (
  current: any,
  previous: any,
  options?: any
) => AnalysisComparisonReport = changeDetectionCore.detectAnalysisChanges;
export const formatRelativeTime: (dateInput: any) => string = changeDetectionCore.formatRelativeTime;
export const formatShortDate: (dateInput: any) => string = changeDetectionCore.formatShortDate;
