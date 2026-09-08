/**
 * TypeScript wrapper for LeadPilot Crawl Diagnostics
 */
import {
  CRAWL_CLASSIFICATIONS,
  COVERAGE_HEALTH_TIERS,
  classifyCrawlFailure,
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
  crawlDurationMs: number;
  totalTextExtracted: number;
  coveragePercentage: number;
  coverageHealth: CoverageHealthTier;
  healthDetails: CoverageHealthInfo;
  hasCoverageWarning: boolean;
  coverageWarning: string | null;
  isSpeculativeSuppressed: boolean;
  suppressionReason: string | null;
  topFailureReasons: FailureReasonSummary[];
  skippedPages: SkippedPageRecord[];
}

export {
  CRAWL_CLASSIFICATIONS,
  COVERAGE_HEALTH_TIERS,
  classifyCrawlFailure,
  getCoverageHealth,
  aggregateTopFailureReasons,
  generateCrawlDiagnosticsReport
};
