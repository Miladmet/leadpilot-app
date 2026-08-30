import core from './growthEngineCore';

export interface ProposalValueResult {
  opportunityCount: number;
  initialProjectFee: number;
  monthlyRetainer: number;
  annualContractValue: number;
  estimatedAgencyMargin: number;
  formattedInitial: string;
  formattedAnnual: string;
  formattedMonthly: string;
  formattedMargin: string;
}

export interface AgencyPricingResult {
  serviceTier: string;
  hoursEstimated: number;
  hourlyRate: number;
  baseCost: number;
  targetMarginPercent: number;
  recommendedProjectFee: number;
  recommendedRetainer: number;
  grossProfit: number;
  formattedProjectFee: string;
  formattedRetainer: string;
  formattedGrossProfit: string;
}

export interface QuickOpportunityScanResult {
  domain: string;
  scannedAt: string;
  overallOpportunityScore: number;
  detectedGapsCount: number;
  estimatedServiceValue: string;
  topOpportunities: {
    service: string;
    severity: string;
    evidence: string;
    suggestedFix: string;
  }[];
  isFreePreview: boolean;
  fullAuditAvailable: boolean;
}

export interface QuickSeoGapResult {
  domain: string;
  seoHealthScore: number;
  criticalGaps: string[];
  quickWins: string[];
  potentialTrafficIncrease: string;
}

export interface QuickCompetitorGapResult {
  domain: string;
  competitorBenchmarkScore: number;
  marketStandardScore: number;
  gapsVsCategoryLeaders: { area: string; status: string }[];
  pitchAngle: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  format: string;
  hook: string;
  outline: string[];
}

export interface ReferralRewardTier {
  track: string;
  target: string;
  reward: string;
  rewardValue: string;
  badge: string;
  color: string;
}

export interface PublicSanitizedAudit {
  id: string;
  companyName: string;
  websiteUrl: string;
  createdAt: string;
  opportunityRange: string;
  opportunityScore: number;
  trustScore: number;
  verificationPassRate: number;
  pagesCrawledCount: number;
  crawlCoveragePercent: number;
  executiveSummary: string;
  topOpportunities: {
    title: string;
    fee: string;
    status: string;
    explanation: string;
  }[];
  competitorGaps: any[];
  verifiedFactsCount: number;
  verifiedFactsPreview: string[];
}

export const calculateProposalValue = core.calculateProposalValue as (
  opportunityCount?: number,
  avgDealSize?: number,
  monthlyRetainer?: number
) => ProposalValueResult;

export const calculateAgencyPricing = core.calculateAgencyPricing as (
  serviceTier?: string,
  targetMargin?: number,
  hoursEstimated?: number,
  hourlyRate?: number
) => AgencyPricingResult;

export const generateQuickOpportunityScan = core.generateQuickOpportunityScan as (domain?: string) => QuickOpportunityScanResult;
export const generateQuickSeoGapCheck = core.generateQuickSeoGapCheck as (domain?: string) => QuickSeoGapResult;
export const generateQuickCompetitorGapSnapshot = core.generateQuickCompetitorGapSnapshot as (domain?: string) => QuickCompetitorGapResult;

export const generateLinkedInPost = core.generateLinkedInPost as (prospect: any) => string;
export const generateTwitterThread = core.generateTwitterThread as (prospect: any) => string;
export const generateAgencyTips = core.generateAgencyTips as (prospect: any) => string;
export const generateWebsiteTeardown = core.generateWebsiteTeardown as (prospect: any) => string;
export const generateOpportunityDiscoveryPost = core.generateOpportunityDiscoveryPost as (prospect: any) => string;

export const generateContentIdeas = core.generateContentIdeas as (prospect: any) => ContentIdea[];
export const generateReferralCode = core.generateReferralCode as (userId?: string) => string;
export const getReferralRewardTiers = core.getReferralRewardTiers as () => ReferralRewardTier[];
export const sanitizePublicAudit = core.sanitizePublicAudit as (prospect: any) => PublicSanitizedAudit | null;
