import core from './sandboxEngineCore';

export interface SandboxEvidence {
  recommendation: string;
  evidenceUsed: string;
  sourcePages: string[];
  confidence: number;
  reasoning: string;
  whyGenerated: string;
}

export interface WebsiteRedesignSandbox {
  type: 'websiteRedesign';
  title: string;
  badge: string;
  description: string;
  currentState: string;
  observedIssues: string[];
  suggestedChanges: string[];
  mockHomepageStructure: {
    heroSection: {
      headline: string;
      subheadline: string;
      badge: string;
    };
    suggestedCTAs: {
      currentCTA: string;
      suggestedCTA: string;
      microcopy: string;
    };
    suggestedNavigation: string[];
    suggestedLeadCaptureFlow: string[];
  };
  evidence: SandboxEvidence;
}

export interface SeoContentSandbox {
  type: 'seoContent';
  title: string;
  badge: string;
  description: string;
  sampleContentArchitecture: {
    resourceHub: string;
    categories: Array<{ name: string; slug: string; intent: string }>;
    suggestedLandingPageStructure: string[];
  };
  evidence: SandboxEvidence;
}

export interface LeadGenerationSandbox {
  type: 'leadGeneration';
  title: string;
  badge: string;
  description: string;
  suggestedLeadFunnel: {
    stage1: string;
    stage2: string;
    stage3: string;
  };
  landingPageExample: {
    title: string;
    leadMagnetConcept: string;
    formFields: string[];
  };
  contactSequenceExample: Array<{
    step: string;
    channel: string;
    subject?: string;
    note?: string;
    preview: string;
  }>;
  discoveryCallFlow: string[];
  evidence: SandboxEvidence;
}

export interface AiAutomationSandbox {
  type: 'aiAutomation';
  title: string;
  badge: string;
  description: string;
  currentProcess: string;
  suggestedProcess: string;
  potentialAutomationWorkflow: Array<{ node: string; desc: string }>;
  automationOpportunities: string[];
  evidence: SandboxEvidence;
}

export interface ConversionOptimizationSandbox {
  type: 'conversionOptimization';
  title: string;
  badge: string;
  description: string;
  currentBlockers: string[];
  proposedExperiments: Array<{ experiment: string; hypothesis: string }>;
  frictionReduction: string[];
  evidence: SandboxEvidence;
}

export interface PricingLicensingSandbox {
  type: 'pricingLicensing';
  title: string;
  badge: string;
  description: string;
  suggestedStructure: Array<{
    tier: string;
    target: string;
    scope: string;
    illustrativeRange: string;
    featured?: boolean;
  }>;
  teamPlans: string;
  licensePackages: string;
  evidence: SandboxEvidence;
}

export interface CompetitorGapSandbox {
  type: 'competitorGap';
  title: string;
  badge: string;
  description: string;
  comparisons: Array<{
    capability: string;
    prospectStatus: string;
    competitorStatus: string;
    potentialFutureCapability: string;
  }>;
  evidence: SandboxEvidence;
}

export interface SolutionSandboxResult {
  isAvailable: boolean;
  status: string;
  reason?: string;
  positioning: {
    title: string;
    subtitle: string;
    badges: string[];
  };
  disclaimer: string;
  trustIntegration?: {
    trustScore: string;
    evidenceQuality: number;
    verificationStatus: string;
    sandboxConfidence: number;
  };
  financialSafety?: {
    illustrativeOpportunityRange: string;
    confidenceLevel: string;
    basedOnModel: string;
    nonGuaranteeNotice: string;
  };
  sandboxes?: {
    websiteRedesign: WebsiteRedesignSandbox;
    seoContent: SeoContentSandbox;
    leadGeneration: LeadGenerationSandbox;
    aiAutomation: AiAutomationSandbox;
    conversionOptimization: ConversionOptimizationSandbox;
    pricingLicensing: PricingLicensingSandbox;
    competitorGap: CompetitorGapSandbox;
  };
}

export const generateSolutionSandbox = core.generateSolutionSandbox as (
  recommendations?: any[],
  prospectContext?: any,
  trustScore?: any
) => SolutionSandboxResult;

export const validateSandboxEntryConditions = core.validateSandboxEntryConditions;
export const SANDBOX_DISCLAIMER = core.SANDBOX_DISCLAIMER as string;
export const SANDBOX_POSITIONING = core.SANDBOX_POSITIONING;
export const MIN_EVIDENCE_QUALITY = core.MIN_EVIDENCE_QUALITY as number;
export const MIN_CONFIDENCE = core.MIN_CONFIDENCE as number;
