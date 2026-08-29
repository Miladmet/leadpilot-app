import core from './opportunityEngineCore';

export interface PricingModelAttribution {
  name: string;
  version: string;
  lastUpdated: string;
  currency: string;
}

export interface ValueRange {
  min: number;
  likely: number;
  max: number;
  formatted: string;
}

export interface ServiceOpportunityCalculation {
  isAvailable: boolean;
  status: string;
  displayValue: string;
  reason?: string;
  serviceName: string;
  detectedProblem: string;
  supportingEvidence: string;
  sourcePages: string[];
  recommendedService: string;
  pricingModel: PricingModelAttribution;
  confidence: number;
  confidenceAdjustment?: number;
  baseServiceCost?: number;
  baseRange?: ValueRange;
  weightedRange?: ValueRange;
  calculationBreakdown?: string[];
  assumptions: string[];
  disclaimer: string;
}

export interface WhyThisProspect {
  detectedOpportunitiesCount: number;
  competitorGapsCount: number;
  monetizationOpportunitiesCount: number;
  confidence: number;
  priority: 'High' | 'Medium' | 'Low';
  reasons: string[];
}

export interface BestServiceRecommendation {
  serviceName: string;
  confidence: number;
  estimatedValue: string;
  likelyValue: string;
  reasons: string[];
}

export interface OpportunityPortfolioResult {
  isAvailable: boolean;
  status: string;
  displayValue: string;
  reason?: string;
  services: ServiceOpportunityCalculation[];
  availableCount?: number;
  portfolio: ValueRange;
  whyThisProspect: WhyThisProspect | null;
  bestServiceRecommendation: BestServiceRecommendation | null;
  pricingModel: PricingModelAttribution;
  assumptions: string[];
  disclaimer: string;
}

export interface ProspectCalculationContext {
  evidenceQuality?: number;
  findingReliability?: number;
  competitorGaps?: any[];
  competitorGapsCount?: number;
}

export const calculateServiceOpportunity = core.calculateServiceOpportunity as (
  service: any,
  options?: { evidenceQuality?: number }
) => ServiceOpportunityCalculation;

export const calculateOpportunityPortfolio = core.calculateOpportunityPortfolio as (
  recommendations?: any[],
  prospectContext?: ProspectCalculationContext
) => OpportunityPortfolioResult;

export const parseFeeRange = core.parseFeeRange as (
  feeString?: string,
  fallbackValue?: number
) => { min: number; max: number; raw: string };

export const PRICING_MODEL = core.PRICING_MODEL as PricingModelAttribution;
export const STANDARD_ASSUMPTIONS = core.STANDARD_ASSUMPTIONS as string[];
export const FINANCIAL_DISCLAIMER = core.FINANCIAL_DISCLAIMER as string;
export const MIN_EVIDENCE_THRESHOLD = core.MIN_EVIDENCE_THRESHOLD as number;
export const MIN_CONFIDENCE_THRESHOLD = core.MIN_CONFIDENCE_THRESHOLD as number;
