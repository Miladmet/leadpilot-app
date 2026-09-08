/**
 * LeadPilot Crawl Diagnostics Core Engine
 * CommonJS module for cross-runtime support (Next.js backend, scripts, and tests)
 */

const CRAWL_CLASSIFICATIONS = {
  FORBIDDEN: '403',
  NOT_FOUND: '404',
  RATE_LIMITED: '429',
  ROBOTS_BLOCKED: 'Robots Blocked',
  TIMEOUT: 'Timeout',
  JAVASCRIPT_REQUIRED: 'JavaScript Required',
  REDIRECT_LOOP: 'Redirect Loop',
  UNKNOWN: 'Unknown',
  CAPPED: 'Capped'
};

const COVERAGE_HEALTH_TIERS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  MODERATE: 'Moderate',
  LIMITED: 'Limited',
  INSUFFICIENT: 'Insufficient'
};

const PRIORITY_CATEGORIES = [
  { category: 'Homepage', weight: 100, keywords: ['/'] },
  { category: 'Services', weight: 95, keywords: ['service', 'services', 'offering', 'offerings', 'solution', 'solutions', 'consulting', 'capabilities'] },
  { category: 'Pricing', weight: 90, keywords: ['pricing', 'price', 'plans', 'plan', 'tier', 'cost', 'subscription', 'rates'] },
  { category: 'About', weight: 85, keywords: ['about', 'about-us', 'company', 'story', 'mission', 'team', 'who-we-are', 'leadership'] },
  { category: 'Contact', weight: 80, keywords: ['contact', 'contact-us', 'reach-us', 'book', 'demo', 'get-in-touch', 'talk-to-us', 'schedule'] },
  { category: 'Case Studies', weight: 75, keywords: ['case-study', 'case-studies', 'case_study', 'customer-stories', 'stories', 'customers', 'portfolio', 'work', 'results'] },
  { category: 'Blog', weight: 70, keywords: ['blog', 'article', 'articles', 'post', 'posts', 'news', 'press', 'insights'] },
  { category: 'Products', weight: 65, keywords: ['product', 'products', 'app', 'apps', 'tool', 'tools', 'platform', 'software', 'feature', 'features'] },
  { category: 'FAQ', weight: 60, keywords: ['faq', 'faqs', 'frequently-asked-questions', 'help', 'support', 'q-and-a', 'docs', 'documentation'] },
  { category: 'Careers', weight: 50, keywords: ['career', 'careers', 'job', 'jobs', 'hiring', 'join-us', 'work-with-us', 'openings'] },
  { category: 'Terms', weight: 30, keywords: ['terms', 'terms-of-service', 'tos', 'terms-and-conditions', 'legal'] },
  { category: 'Privacy', weight: 25, keywords: ['privacy', 'privacy-policy', 'privacy-notice', 'gdpr'] }
];

function classifyUrl(url, anchorText = '') {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase() + ' ' + (anchorText || '').toLowerCase();
    
    if (parsed.pathname === '/' || parsed.pathname === '') {
      return { category: 'Homepage', weight: 100 };
    }

    for (const item of PRIORITY_CATEGORIES) {
      if (item.category === 'Homepage') continue;
      for (const kw of item.keywords) {
        if (path.includes(kw)) {
          return { category: item.category, weight: item.weight };
        }
      }
    }
    return { category: 'General', weight: 20 };
  } catch (e) {
    return { category: 'General', weight: 10 };
  }
}

/**
 * Classifies why a page was skipped or failed to crawl.
 * @param {Object} params
 * @param {number|null} [params.statusCode] - HTTP status code
 * @param {string} [params.errorMessage] - Error string from crawler
 * @param {string} [params.html] - Raw HTML returned (if any)
 * @param {boolean} [params.isRobotsBlocked] - Whether disallowed by robots.txt
 * @param {boolean} [params.isCapped] - Whether omitted due to crawl budget cap
 * @returns {{ classification: string, failureReason: string, statusCode: number|null }}
 */
function classifyCrawlFailure(params = {}) {
  const { statusCode, errorMessage = '', html = '', isRobotsBlocked = false, isCapped = false } = params;
  const msgLower = (errorMessage || '').toLowerCase();

  // 1. Robots.txt block
  if (isRobotsBlocked || msgLower.includes('robots') || msgLower.includes('disallowed')) {
    return {
      classification: CRAWL_CLASSIFICATIONS.ROBOTS_BLOCKED,
      failureReason: 'Disallowed by website robots.txt rules.',
      statusCode: statusCode || null
    };
  }

  // 2. HTTP Status Code Classifications
  if (statusCode === 403) {
    return {
      classification: CRAWL_CLASSIFICATIONS.FORBIDDEN,
      failureReason: '403 Forbidden: Server or WAF blocked crawler access.',
      statusCode: 403
    };
  }

  if (statusCode === 404) {
    return {
      classification: CRAWL_CLASSIFICATIONS.NOT_FOUND,
      failureReason: '404 Not Found: Page URL does not exist or link is broken.',
      statusCode: 404
    };
  }

  if (statusCode === 429) {
    return {
      classification: CRAWL_CLASSIFICATIONS.RATE_LIMITED,
      failureReason: '429 Too Many Requests: Rate limiting triggered by target server.',
      statusCode: 429
    };
  }

  // 3. Redirect Loop detection
  if (
    msgLower.includes('redirect') ||
    msgLower.includes('maxredirects') ||
    msgLower.includes('too many redirects') ||
    msgLower.includes('err_too_many_redirects')
  ) {
    return {
      classification: CRAWL_CLASSIFICATIONS.REDIRECT_LOOP,
      failureReason: 'Redirect Loop: Exceeded maximum redirect hops or circular redirect detected.',
      statusCode: statusCode || 308
    };
  }

  // 4. Timeout detection
  if (
    msgLower.includes('timeout') ||
    msgLower.includes('timed out') ||
    msgLower.includes('etimedout') ||
    msgLower.includes('econnaborted')
  ) {
    return {
      classification: CRAWL_CLASSIFICATIONS.TIMEOUT,
      failureReason: 'Timeout: Target server took longer than 4.5s to respond.',
      statusCode: statusCode || null
    };
  }

  // 5. JavaScript Required (Client-side rendered SPA with empty server HTML)
  if (html && typeof html === 'string') {
    const isSpaShell =
      html.includes('<noscript>') ||
      /<div\s+id=["'](?:root|__next|app|mount)["'][^>]*>\s*<\/div>/i.test(html) ||
      html.includes('You need to enable JavaScript to run this app');

    if (isSpaShell && (!params.textLength || params.textLength < 60)) {
      return {
        classification: CRAWL_CLASSIFICATIONS.JAVASCRIPT_REQUIRED,
        failureReason: 'JavaScript Required: Page renders client-side via SPA framework (React/Vue) with empty initial HTML.',
        statusCode: statusCode || 200
      };
    }
  }

  // 6. Crawl budget cap
  if (isCapped) {
    return {
      classification: CRAWL_CLASSIFICATIONS.CAPPED,
      failureReason: 'Discovered link exceeded maximum crawl budget of prioritized pages.',
      statusCode: null
    };
  }

  // 7. Unknown / Generic network error
  return {
    classification: CRAWL_CLASSIFICATIONS.UNKNOWN,
    failureReason: errorMessage ? `Crawl failed: ${errorMessage}` : 'Unable to extract textual content from URL.',
    statusCode: statusCode || null
  };
}

/**
 * Computes coverage health rating and styling.
 * @param {number} coveragePercentage
 * @returns {{ health: string, label: string, badgeClass: string, alertClass: string, description: string }}
 */
function getCoverageHealth(coveragePercentage) {
  const pct = Math.max(0, Math.min(100, Math.round(coveragePercentage || 0)));

  if (pct >= 90) {
    return {
      health: COVERAGE_HEALTH_TIERS.EXCELLENT,
      label: 'Excellent Coverage',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      alertClass: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      description: 'Comprehensive crawl across primary, service, and technical pages for high-confidence intelligence.'
    };
  }

  if (pct >= 70) {
    return {
      health: COVERAGE_HEALTH_TIERS.GOOD,
      label: 'Good Coverage',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
      alertClass: 'bg-teal-50 border-teal-300 text-teal-900',
      description: 'Strong coverage of major conversion, offering, and about pages.'
    };
  }

  if (pct >= 40) {
    return {
      health: COVERAGE_HEALTH_TIERS.MODERATE,
      label: 'Moderate Coverage',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      alertClass: 'bg-amber-50 border-amber-300 text-amber-900',
      description: 'Partial site crawl. Core pages analyzed, but several internal routes were inaccessible or skipped.'
    };
  }

  if (pct >= 20) {
    return {
      health: COVERAGE_HEALTH_TIERS.LIMITED,
      label: 'Limited Coverage',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
      alertClass: 'bg-orange-50 border-orange-300 text-orange-900',
      description: 'Low coverage (20-39%). High ratio of skipped or blocked routes. Audit findings carry moderate certainty.'
    };
  }

  return {
    health: COVERAGE_HEALTH_TIERS.INSUFFICIENT,
    label: 'Insufficient Coverage',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    alertClass: 'bg-rose-50 border-rose-300 text-rose-900',
    description: 'Critical coverage deficit (<20%). Speculative revenue and contract values have been suppressed to protect agency credibility.'
  };
}

/**
 * Aggregates top failure reasons sorted by frequency.
 * @param {Array<{ classification: string, failureReason: string }>} skippedPages
 * @returns {Array<{ classification: string, label: string, count: number, percentage: number }>}
 */
function aggregateTopFailureReasons(skippedPages = []) {
  if (!Array.isArray(skippedPages) || skippedPages.length === 0) {
    return [];
  }

  const counts = {};
  const sampleReasons = {};

  skippedPages.forEach(p => {
    const cls = p.classification || CRAWL_CLASSIFICATIONS.UNKNOWN;
    counts[cls] = (counts[cls] || 0) + 1;
    if (!sampleReasons[cls] && p.failureReason) {
      sampleReasons[cls] = p.failureReason;
    }
  });

  const total = skippedPages.length;
  const reasons = Object.entries(counts).map(([cls, count]) => {
    return {
      classification: cls,
      label: formatClassificationLabel(cls),
      count,
      percentage: Math.round((count / total) * 100),
      sampleReason: sampleReasons[cls] || ''
    };
  });

  // Sort descending by count
  reasons.sort((a, b) => b.count - a.count);
  return reasons;
}

function formatClassificationLabel(cls) {
  switch (cls) {
    case CRAWL_CLASSIFICATIONS.FORBIDDEN:
      return '403 Forbidden (Blocked / WAF)';
    case CRAWL_CLASSIFICATIONS.NOT_FOUND:
      return '404 Not Found';
    case CRAWL_CLASSIFICATIONS.RATE_LIMITED:
      return '429 Rate Limited';
    case CRAWL_CLASSIFICATIONS.ROBOTS_BLOCKED:
      return 'Robots Blocked';
    case CRAWL_CLASSIFICATIONS.TIMEOUT:
      return 'Connection Timeout';
    case CRAWL_CLASSIFICATIONS.JAVASCRIPT_REQUIRED:
      return 'JavaScript Required (SPA)';
    case CRAWL_CLASSIFICATIONS.REDIRECT_LOOP:
      return 'Redirect Loop';
    case CRAWL_CLASSIFICATIONS.CAPPED:
      return 'Crawl Budget Cap';
    default:
      return 'Unknown / Unreachable';
  }
}

/**
 * Generates the complete Crawl Diagnostics Report.
 * @param {Object} data
 * @returns {Object}
 */
function generateCrawlDiagnosticsReport(data = {}) {
  const pagesDiscovered = Number(data.pagesDiscovered || 0);
  const pagesCrawled = Number(data.pagesCrawled || 0);
  const pagesSkipped = Math.max(0, Number(data.pagesSkipped !== undefined ? data.pagesSkipped : (pagesDiscovered - pagesCrawled)));
  const crawlDurationMs = Number(data.crawlDurationMs || 0);
  const totalTextExtracted = Number(data.totalTextExtracted || 0);
  const sitemapDiscoveredCount = Number(data.sitemapDiscoveredCount || 0);

  const coveragePercentage = pagesDiscovered > 0
    ? Math.min(100, Math.round((pagesCrawled / pagesDiscovered) * 100))
    : 100;

  const coverageHealth = getCoverageHealth(coveragePercentage);
  const skippedPages = Array.isArray(data.skippedPages) ? data.skippedPages : [];
  const topFailureReasons = aggregateTopFailureReasons(skippedPages);

  // Coverage warning triggered when below 60%
  const hasCoverageWarning = coveragePercentage < 60;
  const coverageWarning = hasCoverageWarning
    ? `Crawl Coverage Warning: ${coveragePercentage}% is below the recommended 60% threshold. Key internal pages may be missing from the analysis.`
    : null;

  // Prevent speculative opportunity values when coverage < 25%
  const isSpeculativeSuppressed = coveragePercentage < 25;
  const suppressionReason = isSpeculativeSuppressed
    ? 'Speculative pipeline revenue and contract values have been suppressed due to insufficient website coverage (<25%).'
    : null;

  return {
    pagesDiscovered,
    pagesCrawled,
    pagesSkipped,
    sitemapDiscoveredCount,
    crawlDurationMs,
    totalTextExtracted,
    coveragePercentage,
    coverageHealth: coverageHealth.health,
    healthDetails: coverageHealth,
    hasCoverageWarning,
    coverageWarning,
    isSpeculativeSuppressed,
    suppressionReason,
    topFailureReasons,
    skippedPages
  };
}

module.exports = {
  CRAWL_CLASSIFICATIONS,
  COVERAGE_HEALTH_TIERS,
  PRIORITY_CATEGORIES,
  classifyUrl,
  classifyCrawlFailure,
  getCoverageHealth,
  aggregateTopFailureReasons,
  generateCrawlDiagnosticsReport
};
