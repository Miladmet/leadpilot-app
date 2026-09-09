/**
 * TypeScript wrapper for LeadPilot Crawl Diagnostics
 */
import {
  CRAWL_CLASSIFICATIONS,
  COVERAGE_HEALTH_TIERS,
  RENDERING_FRAMEWORKS,
  RENDERING_METHODS,
  COVERAGE_IMPACT,
  BUSINESS_PAGE_CATEGORIES,
  classifyCrawlFailure,
  detectRenderingDiagnostics,
  getAdaptiveCrawlLimit,
  computeBusinessCoverage,
  computeOpportunityReadiness,
  computeCoverageReason,
  getCoverageHealth,
  aggregateTopFailureReasons,
  generateCrawlDiagnosticsReport
} from './crawlDiagnosticsCore';

export type CrawlClassification =
  | '403'
  | '404'
  | '429'
  | 'Robots Blocked'
  | 'Timeout'
  | 'JavaScript Required'
  | 'Redirect Loop'
  | 'Unknown'
  | 'Capped';

export type CoverageHealthTier = 'Excellent' | 'Good' | 'Moderate' | 'Limited' | 'Insufficient';

export type FrameworkType = 'Next.js' | 'React' | 'Angular' | 'Vue' | 'Nuxt' | 'Remix' | 'None' | 'Unknown';

export type RenderingMethodType =
  | 'Client-Side Rendering (CSR)'
  | 'Server-Side Rendering (SSR) / Static'
  | 'Hybrid (SSR + CSR)'
  | 'Server-Rendered HTML';

export type CoverageImpactType = 'Low' | 'Medium' | 'High';

export interface RenderingDiagnostics {
  framework: FrameworkType;
  renderingMethod: RenderingMethodType;
  isJavaScriptHeavy: boolean;
  coverageImpact: CoverageImpactType;
  textExtracted: number;
  htmlSizeBytes: number;
  scriptCount: number;
  message: string | null;
  signals: string[];
}

export interface CoverageReason {
  primaryReason: string;
  cappedCount: number;
  robotsCount: number;
  timeoutCount: number;
  jsCount: number;
  explanation: string;
}

export interface SkippedPageRecord {
  url: string;
  title?: string;
  category?: string;
  depth?: number;
  statusCode: number | null;
  failureReason: string;
  classification: CrawlClassification;
  discoveredFrom?: string;
}

export interface FailureReasonSummary {
  classification: CrawlClassification;
  label: string;
  count: number;
  percentage: number;
  sampleReason?: string;
}

export interface CoverageHealthInfo {
  health: CoverageHealthTier;
  label: string;
  badgeClass: string;
  alertClass: string;
  description: string;
}

export interface CrawlDiagnosticsReport {
  pagesDiscovered: number;
  pagesCrawled: number;
  pagesSkipped: number;
  sitemapDiscoveredCount?: number;
  crawlLimit?: number;
  crawlDurationMs: number;
  totalTextExtracted: number;
  coveragePercentage: number;
  rawCoveragePercentage: number;
  businessCoveragePercentage: number;
  opportunityReadinessScore: number;
  coverageHealth: CoverageHealthTier;
  healthDetails: CoverageHealthInfo;
  hasCoverageWarning: boolean;
  coverageWarning: string | null;
  isSpeculativeSuppressed: boolean;
  suppressionReason: string | null;
  coverageReason?: CoverageReason;
  topFailureReasons: FailureReasonSummary[];
  skippedPages: SkippedPageRecord[];
  renderingDiagnostics?: RenderingDiagnostics | null;
}

export {
  CRAWL_CLASSIFICATIONS,
  COVERAGE_HEALTH_TIERS,
  RENDERING_FRAMEWORKS,
  RENDERING_METHODS,
  COVERAGE_IMPACT,
  BUSINESS_PAGE_CATEGORIES,
  classifyCrawlFailure,
  detectRenderingDiagnostics,
  getAdaptiveCrawlLimit,
  computeBusinessCoverage,
  computeOpportunityReadiness,
  computeCoverageReason,
  getCoverageHealth,
  aggregateTopFailureReasons,
  generateCrawlDiagnosticsReport
};
