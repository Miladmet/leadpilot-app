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

// ---------------------------------------------------------------------------
// RENDERING DIAGNOSTICS: JavaScript-Heavy Website Detection Engine
// ---------------------------------------------------------------------------

const RENDERING_FRAMEWORKS = {
  NEXTJS: 'Next.js',
  REACT: 'React',
  ANGULAR: 'Angular',
  VUE: 'Vue',
  NUXT: 'Nuxt',
  REMIX: 'Remix',
  NONE: 'None',
  UNKNOWN: 'Unknown'
};

const RENDERING_METHODS = {
  CSR: 'Client-Side Rendering (CSR)',
  SSR: 'Server-Side Rendering (SSR) / Static',
  HYBRID: 'Hybrid (SSR + CSR)',
  SERVER_HTML: 'Server-Rendered HTML'
};

const COVERAGE_IMPACT = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

// Framework signal matchers
const FRAMEWORK_SIGNALS = [
  {
    framework: RENDERING_FRAMEWORKS.NEXTJS,
    patterns: [
      /__NEXT_DATA__/,
      /id=["']__next["']/,
      /\/_next\/static\//,
      /next-head-count/,
      /__NEXT_ROUTER__/,
      /data-nextjs/,
      /__next/
    ]
  },
  {
    framework: RENDERING_FRAMEWORKS.NUXT,
    patterns: [
      /__NUXT__/,
      /id=["']__nuxt["']/,
      /\/_nuxt\//,
      /__nuxt_page/,
      /nuxtjs/i
    ]
  },
  {
    framework: RENDERING_FRAMEWORKS.REMIX,
    patterns: [
      /window\.__remixContext/,
      /data-remix/,
      /\/build\/manifest-/,
      /__remixManifest/
    ]
  },
  {
    framework: RENDERING_FRAMEWORKS.ANGULAR,
    patterns: [
      /ng-version/,
      /<app-root[\s>]/,
      /ng-star-inserted/,
      /angular\.js/i,
      /ng-app/,
      /\[ng-/,
      /\.module\.js/
    ]
  },
  {
    framework: RENDERING_FRAMEWORKS.VUE,
    patterns: [
      /data-v-[a-f0-9]{7,}/,
      /__vue__/,
      /vue\.js/i,
      /vue\.min\.js/i,
      /\/vue@/
    ]
  },
  {
    framework: RENDERING_FRAMEWORKS.REACT,
    patterns: [
      /id=["']root["']/,
      /data-reactroot/,
      /_reactListening/,
      /__reactFiber/,
      /react-dom/i,
      /react\.production\.min\.js/,
      /react\.development\.js/
    ]
  }
];

/**
 * Detects JavaScript rendering framework and computes rendering diagnostics.
 * @param {Object} params
 * @param {string} params.html - Raw HTML of the page
 * @param {number} [params.textLength] - Length of extracted text
 * @param {number} [params.statusCode] - HTTP status code
 * @param {number} [params.htmlSizeBytes] - Total HTML payload size in bytes
 * @returns {{
 *   framework: string,
 *   renderingMethod: string,
 *   isJavaScriptHeavy: boolean,
 *   coverageImpact: string,
 *   textExtracted: number,
 *   htmlSizeBytes: number,
 *   scriptCount: number,
 *   message: string|null,
 *   signals: string[]
 * }}
 */
function detectRenderingDiagnostics(params = {}) {
  const { html = '', textLength = 0, statusCode = null, htmlSizeBytes = 0 } = params;

  const htmlStr = typeof html === 'string' ? html : '';
  const detectedSignals = [];
  let detectedFramework = RENDERING_FRAMEWORKS.UNKNOWN;

  // Count script tags
  const scriptMatches = htmlStr.match(/<script[\s>]/gi) || [];
  const scriptCount = scriptMatches.length;

  // Compute HTML size
  const payloadBytes = htmlSizeBytes || Buffer.byteLength(htmlStr, 'utf8');

  // Detect framework by matched signals
  for (const { framework, patterns } of FRAMEWORK_SIGNALS) {
    const matched = patterns.filter(p => p.test(htmlStr));
    if (matched.length > 0) {
      detectedFramework = framework;
      matched.forEach(p => detectedSignals.push(`${framework}: ${p.toString()}`));
      break; // Take first framework match (most specific wins)
    }
  }

  // If no known framework matched but has SPA shell markers
  if (detectedFramework === RENDERING_FRAMEWORKS.UNKNOWN) {
    const hasSpaMount = /id=["'](?:root|app|mount|main|react-app)["']/.test(htmlStr);
    const hasNoscript = /<noscript>/.test(htmlStr) && textLength < 200;
    if (hasSpaMount || hasNoscript) {
      detectedFramework = RENDERING_FRAMEWORKS.REACT; // Most common SPA pattern
      detectedSignals.push('SPA mount point detected');
    }
  }

  // If no JS framework detected at all
  if (detectedSignals.length === 0) {
    detectedFramework = RENDERING_FRAMEWORKS.NONE;
  }

  // Determine rendering method
  const hasHydrationData = /__NEXT_DATA__|__NUXT__|window\.__remixContext/.test(htmlStr);
  const hasSsrContent = textLength > 500;
  const hasEmptyMount = /id=["'](?:root|__next|__nuxt|app)["'][^>]*>\s*<\/div>/i.test(htmlStr);

  let renderingMethod;
  if (hasHydrationData && hasSsrContent) {
    renderingMethod = RENDERING_METHODS.HYBRID;
  } else if (hasHydrationData && !hasSsrContent) {
    renderingMethod = RENDERING_METHODS.CSR;
  } else if (hasEmptyMount) {
    renderingMethod = RENDERING_METHODS.CSR;
  } else if (detectedFramework !== RENDERING_FRAMEWORKS.NONE && textLength > 300) {
    renderingMethod = RENDERING_METHODS.SSR;
  } else if (detectedFramework === RENDERING_FRAMEWORKS.NONE) {
    renderingMethod = RENDERING_METHODS.SERVER_HTML;
  } else {
    renderingMethod = RENDERING_METHODS.CSR;
  }

  // JavaScript-heavy determination:
  // High script count (>8), low extracted text (<300 chars), or large payload with low text
  const isScriptHeavy = scriptCount >= 8;
  const isLowText = textLength < 300;
  const isPayloadAsymmetric = payloadBytes > 25000 && textLength < 500;
  const isCsrMode = renderingMethod === RENDERING_METHODS.CSR;

  const isJavaScriptHeavy = isCsrMode || isPayloadAsymmetric || (isScriptHeavy && isLowText);

  // Coverage impact
  let coverageImpact;
  if (renderingMethod === RENDERING_METHODS.CSR && textLength < 100) {
    coverageImpact = COVERAGE_IMPACT.HIGH;
  } else if (isJavaScriptHeavy && textLength < 500) {
    coverageImpact = COVERAGE_IMPACT.MEDIUM;
  } else {
    coverageImpact = COVERAGE_IMPACT.LOW;
  }

  // Build informational message for JavaScript-heavy sites
  const message = isJavaScriptHeavy
    ? 'Website appears to rely heavily on client-side rendering. Coverage may be lower than expected.'
    : null;

  return {
    framework: detectedFramework,
    renderingMethod,
    isJavaScriptHeavy,
    coverageImpact,
    textExtracted: textLength,
    htmlSizeBytes: payloadBytes,
    scriptCount,
    message,
    signals: detectedSignals
  };
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

// ---------------------------------------------------------------------------
// INTELLIGENT CRAWL COVERAGE ENGINE
// ---------------------------------------------------------------------------

/**
 * Business-priority page categories used for business coverage scoring.
 * Only these categories count toward businessCoveragePercentage.
 */
const BUSINESS_PAGE_CATEGORIES = [
  'Homepage', 'Services', 'Pricing', 'About', 'Contact',
  'Locations', 'Case Studies', 'Resources'
];

/**
 * Returns adaptive crawl limit based on total URLs discovered.
 * @param {number} totalUrls - Total URL count (sitemap + discovered links)
 * @returns {number} maxPages to crawl
 */
function getAdaptiveCrawlLimit(totalUrls) {
  const n = Number(totalUrls) || 1;
  if (n < 50) return n;         // crawl all  (<50 discovered)
  if (n < 200) return 50;       // medium sites
  if (n < 1000) return 100;     // large sites
  return 150;                   // very large sites (1000+)
}

/**
 * Computes business coverage: ratio of high-value business pages crawled.
 * @param {Record<string,number>} crawledCategories - { category: count } for crawled pages
 * @param {Record<string,number>} discoveredCategories - { category: count } for all discovered pages
 * @returns {number} 0-100 percentage
 */
function computeBusinessCoverage(crawledCategories = {}, discoveredCategories = {}) {
  let crawledBusiness = 0;
  let discoveredBusiness = 0;

  for (const cat of BUSINESS_PAGE_CATEGORIES) {
    crawledBusiness += Number(crawledCategories[cat] || 0);
    discoveredBusiness += Number(discoveredCategories[cat] || 0);
  }

  // Always expect at least 5 business pages (prevents 100% on 1-page sites)
  const denominator = Math.max(discoveredBusiness, 5);
  return Math.min(100, Math.round((crawledBusiness / denominator) * 100));
}

/**
 * Computes Opportunity Readiness Score (0-100) based on which critical
 * business pages were actually crawled and how much text was extracted.
 * @param {Record<string,number>} crawledCategories
 * @param {number} totalTextExtracted
 * @returns {number} 0-100 score
 */
function computeOpportunityReadiness(crawledCategories = {}, totalTextExtracted = 0) {
  let score = 0;

  // Core page bonuses
  if ((crawledCategories['Homepage'] || 0) > 0) score += 40;
  if ((crawledCategories['Services'] || 0) > 0) score += 20;
  if ((crawledCategories['Pricing'] || 0) > 0) score += 15;
  if ((crawledCategories['About'] || 0) > 0) score += 10;
  if ((crawledCategories['Contact'] || 0) > 0) score += 10;

  // Text extraction quality bonus
  if (Number(totalTextExtracted) > 5000) score += 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Classifies the primary reason pages were not crawled.
 * @param {Array<{classification: string}>} skippedPages
 * @param {number} crawlLimit - The adaptive crawl limit applied
 * @returns {{ primaryReason: string, cappedCount: number, robotsCount: number, timeoutCount: number, jsCount: number, explanation: string }}
 */
function computeCoverageReason(skippedPages = [], crawlLimit = 20) {
  const counts = {
    capped: 0,
    robots: 0,
    timeout: 0,
    js: 0,
    forbidden: 0,
    notFound: 0,
    rateLimited: 0,
    unknown: 0
  };

  for (const p of skippedPages) {
    const cls = (p.classification || '').toLowerCase();
    if (cls === 'capped') counts.capped++;
    else if (cls === 'robots blocked') counts.robots++;
    else if (cls === 'timeout') counts.timeout++;
    else if (cls === 'javascript required') counts.js++;
    else if (cls === '403') counts.forbidden++;
    else if (cls === '404') counts.notFound++;
    else if (cls === '429') counts.rateLimited++;
    else counts.unknown++;
  }

  // Determine primary reason (highest count)
  let primaryReason = 'No pages skipped';
  let maxCount = 0;

  const candidates = [
    { reason: 'Crawl limit reached', count: counts.capped },
    { reason: 'Robots blocked', count: counts.robots },
    { reason: 'Timeout', count: counts.timeout },
    { reason: 'JavaScript required', count: counts.js },
    { reason: '403 Forbidden', count: counts.forbidden },
    { reason: '404 Not Found', count: counts.notFound },
    { reason: '429 Rate limited', count: counts.rateLimited },
    { reason: 'Unknown', count: counts.unknown }
  ];

  for (const { reason, count } of candidates) {
    if (count > maxCount) {
      maxCount = count;
      primaryReason = reason;
    }
  }

  // Build human-readable explanation
  const parts = [];
  if (counts.capped > 0) parts.push(`${counts.capped} page${counts.capped > 1 ? 's' : ''} omitted by crawl limit (${crawlLimit}-page cap)`);
  if (counts.robots > 0) parts.push(`${counts.robots} blocked by robots.txt`);
  if (counts.timeout > 0) parts.push(`${counts.timeout} timed out`);
  if (counts.js > 0) parts.push(`${counts.js} require JavaScript rendering`);
  if (counts.forbidden > 0) parts.push(`${counts.forbidden} returned 403 Forbidden`);
  if (counts.notFound > 0) parts.push(`${counts.notFound} returned 404 Not Found`);
  if (counts.rateLimited > 0) parts.push(`${counts.rateLimited} rate-limited (429)`);

  const explanation = parts.length > 0
    ? parts.join('; ') + '.'
    : 'All discovered pages were crawled successfully.';

  return {
    primaryReason,
    cappedCount: counts.capped,
    robotsCount: counts.robots,
    timeoutCount: counts.timeout,
    jsCount: counts.js,
    explanation
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
 * Generates the complete Crawl Diagnostics Report with intelligent coverage metrics.
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
  const crawlLimit = Number(data.crawlLimit || 20);

  // --- RAW COVERAGE (traditional ratio, always shown, never drives suppression) ---
  const rawCoveragePercentage = pagesDiscovered > 0
    ? Math.min(100, Math.round((pagesCrawled / pagesDiscovered) * 100))
    : 100;

  // For backward compatibility, coveragePercentage = rawCoveragePercentage
  const coveragePercentage = rawCoveragePercentage;

  // --- BUSINESS COVERAGE (high-value pages only) ---
  const crawledCategories = data.crawledCategories || {};
  const discoveredCategories = data.discoveredCategories || {};
  const businessCoveragePercentage = computeBusinessCoverage(crawledCategories, discoveredCategories);

  // --- OPPORTUNITY READINESS SCORE (0-100 composite) ---
  const opportunityReadinessScore = computeOpportunityReadiness(crawledCategories, totalTextExtracted);

  // --- COVERAGE HEALTH (based on business coverage, not raw) ---
  const coverageHealth = getCoverageHealth(businessCoveragePercentage);

  const skippedPages = Array.isArray(data.skippedPages) ? data.skippedPages : [];
  const topFailureReasons = aggregateTopFailureReasons(skippedPages);

  // --- COVERAGE REASON ---
  const coverageReason = computeCoverageReason(skippedPages, crawlLimit);

  // --- COVERAGE WARNING (triggers on business coverage < 40%, not raw) ---
  const hasCoverageWarning = businessCoveragePercentage < 40;
  const coverageWarning = hasCoverageWarning
    ? `Business Coverage Warning: ${businessCoveragePercentage}% of key business pages were analyzed. Homepage, services, pricing, and contact pages may be missing from the audit.`
    : null;

  // --- INTELLIGENT SUPPRESSION: only suppress when evidence is genuinely insufficient ---
  // Suppresses ONLY when ALL three conditions are met:
  //   1. opportunityReadinessScore < 30   (critical pages missing)
  //   2. businessCoveragePercentage < 20  (no meaningful business content reached)
  //   3. totalTextExtracted < 2000        (text extraction too low for analysis)
  const isSpeculativeSuppressed =
    opportunityReadinessScore < 30 &&
    businessCoveragePercentage < 20 &&
    totalTextExtracted < 2000;

  const suppressionReason = isSpeculativeSuppressed
    ? `Speculative pipeline values suppressed: Opportunity Readiness Score is ${opportunityReadinessScore}/100. Critical business pages were not analyzed and text extraction was insufficient (${totalTextExtracted} chars). This safeguards agency credibility.`
    : null;

  // Pass through rendering diagnostics (computed externally from page HTML)
  const renderingDiagnostics = data.renderingDiagnostics || null;

  return {
    // Counts
    pagesDiscovered,
    pagesCrawled,
    pagesSkipped,
    sitemapDiscoveredCount,
    crawlLimit,
    crawlDurationMs,
    totalTextExtracted,

    // Coverage metrics
    coveragePercentage,           // = rawCoveragePercentage (backward compat)
    rawCoveragePercentage,
    businessCoveragePercentage,
    opportunityReadinessScore,

    // Health
    coverageHealth: coverageHealth.health,
    healthDetails: coverageHealth,

    // Warnings & suppression
    hasCoverageWarning,
    coverageWarning,
    isSpeculativeSuppressed,
    suppressionReason,

    // Diagnostics
    coverageReason,
    topFailureReasons,
    skippedPages,
    renderingDiagnostics
  };
}

module.exports = {
  CRAWL_CLASSIFICATIONS,
  COVERAGE_HEALTH_TIERS,
  RENDERING_FRAMEWORKS,
  RENDERING_METHODS,
  COVERAGE_IMPACT,
  BUSINESS_PAGE_CATEGORIES,
  PRIORITY_CATEGORIES,
  classifyUrl,
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


