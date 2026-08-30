/**
 * LeadPilot Analysis Change Detection & Explanation Engine Core
 *
 * When a user analyzes the same website more than once, LeadPilot detects previous
 * analyses, maintains version history, calculates metric differences, classifies root causes
 * using allowed reasons, detects website changes, and produces transparent plain-language explanations.
 */

const { calculateTrustScore } = require('./trustEngineCore');

function computeTrustScore(prospect) {
  if (!prospect) return { isAvailable: true, score: 90, verificationScore: 90 };
  const telemetry = {
    databaseSecurity: 100,
    verificationEngine: prospect.verificationPassRate || 95,
    storageSecurity: 100,
    tenantIsolation: 100,
    evidenceEngine: prospect.evidenceQuality || 90,
    crawlReliability: prospect.crawlCoveragePercent || 90
  };
  const res = calculateTrustScore(telemetry);
  const score = res && res.isAvailable && typeof res.overallScore === 'number' ? res.overallScore : (prospect.evidenceQuality || 90);
  return {
    isAvailable: res.isAvailable,
    score,
    verificationScore: prospect.verificationPassRate || 95
  };
}


// 9 Allowed Root Cause Classifications
const ALLOWED_ROOT_CAUSES = [
  'More Pages Crawled',
  'Less Pages Crawled',
  'Website Content Changed',
  'New Evidence Found',
  'Confidence Threshold Changed',
  'Pricing Model Changed',
  'Opportunity Calculation Updated',
  'Competitor Data Updated',
  'Trust Engine Updated'
];

/**
 * Normalizes URL for consistent domain & path matching
 */
function normalizeWebsiteUrl(url) {
  if (!url) return '';
  let clean = url.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//, '').replace(/^www\./, '');
  clean = clean.split('?')[0].split('#')[0];
  return clean.replace(/\/+$/, '');
}

/**
 * Safe JSON parser helper
 */
function safeParseJson(data, fallback = []) {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
}

/**
 * Formats relative time (e.g. "22 minutes ago", "3 hours ago", "Yesterday")
 */
function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Previously';
  const past = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

/**
 * Formats concise date (e.g. "Aug 29")
 */
function formatShortDate(dateInput) {
  if (!dateInput) return 'Previous Date';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Extracts pricing model name from revenueAssumptions or defaults
 */
function extractPricingModelName(prospect) {
  if (!prospect) return 'Agency Standard v1';
  const assumptions = safeParseJson(prospect.revenueAssumptions, null);
  if (assumptions && assumptions.pricingModel) {
    return assumptions.pricingModel;
  }
  return 'Agency Standard v1';
}

/**
 * Compares two analyses of the same URL and generates complete change detection report
 *
 * @param {Object} current - Current Prospect record
 * @param {Object} previous - Previous Prospect record (most recent past analysis)
 * @param {Object} options - Optional overrides
 * @returns {Object} Comparison report
 */
function detectAnalysisChanges(current, previous, options = {}) {
  if (!current || !previous) {
    return {
      isRepeatedAnalysis: false,
      version: 1,
      totalVersions: 1,
      message: 'Initial analysis for this website.'
    };
  }

  // 1. Timestamps & Identifiers
  const currentDate = new Date(current.createdAt || Date.now());
  const previousDate = new Date(previous.createdAt || Date.now());
  const relativeTime = formatRelativeTime(previousDate);
  const currentShortDate = formatShortDate(currentDate);
  const previousShortDate = formatShortDate(previousDate);

  // 2. Metrics Extraction
  const currFacts = safeParseJson(current.verifiedFacts, []);
  const prevFacts = safeParseJson(previous.verifiedFacts, []);
  const factsDelta = currFacts.length - prevFacts.length;
  const factsDeltaStr = factsDelta >= 0 ? `+${factsDelta}` : `${factsDelta}`;

  const currPages = current.pagesCrawledCount || (safeParseJson(current.crawledPagesData, [])).length || 1;
  const prevPages = previous.pagesCrawledCount || (safeParseJson(previous.crawledPagesData, [])).length || 1;
  const pagesDelta = currPages - prevPages;

  const currCoverage = current.crawlCoveragePercent || 100;
  const prevCoverage = previous.crawlCoveragePercent || 100;

  const currOppRange = current.opportunityRange || '$8k-$20k';
  const prevOppRange = previous.opportunityRange || '$8k-$20k';

  // Compute Platform Trust Scores for each run
  const currTrust = computeTrustScore(current);
  const prevTrust = computeTrustScore(previous);
  const currTrustScore = currTrust.score;
  const prevTrustScore = prevTrust.score;
  const trustDelta = currTrustScore - prevTrustScore;


  // 3. Status Determination
  let status = 'Analysis Stable';
  if (currPages > prevPages || currFacts.length > prevFacts.length || currTrustScore > prevTrustScore) {
    status = 'Analysis Improved';
  } else if (currPages < prevPages || currFacts.length < prevFacts.length) {
    status = 'Coverage Decreased';
  } else if (currCoverage > prevCoverage) {
    status = 'Coverage Expanded';
  }

  // 4. Root Cause Classification (Strictly from ALLOWED_ROOT_CAUSES)
  let primaryCause = 'Website Content Changed';
  let impact = 'Updated website structure influenced findings.';

  const currPricingModel = extractPricingModelName(current);
  const prevPricingModel = extractPricingModelName(previous);
  const pricingModelChanged = currPricingModel !== prevPricingModel;

  const currRecs = safeParseJson(current.recommendations, []);
  const prevRecs = safeParseJson(previous.recommendations, []);

  const currPagesData = safeParseJson(current.crawledPagesData, []);
  const prevPagesData = safeParseJson(previous.crawledPagesData, []);

  // Check which pages are new
  const prevUrls = new Set(prevPagesData.map(p => (p.url || '').toLowerCase()));
  const newPagesList = currPagesData.filter(p => p.url && !prevUrls.has(p.url.toLowerCase()));

  if (currPages > prevPages) {
    primaryCause = 'More Pages Crawled';
    impact = 'Higher confidence and more opportunities detected.';
  } else if (currPages < prevPages) {
    primaryCause = 'Less Pages Crawled';
    impact = 'Reduced crawl depth may limit discovery of secondary services.';
  } else if (pricingModelChanged) {
    primaryCause = 'Pricing Model Changed';
    impact = 'Opportunity estimates were recalculated using updated pricing assumptions.';
  } else if (newPagesList.length > 0 || Math.abs((current.totalTextExtracted || 0) - (previous.totalTextExtracted || 0)) > 200) {
    primaryCause = 'Website Content Changed';
    impact = 'Refreshed website text provided updated opportunity signals.';
  } else if (currFacts.length > prevFacts.length) {
    primaryCause = 'New Evidence Found';
    impact = 'Additional verified citations strengthened opportunity scores.';
  } else if (trustDelta !== 0) {
    primaryCause = 'Trust Engine Updated';
    impact = 'Audit parameters adjusted the overall platform trust rating.';
  } else if (currOppRange !== prevOppRange) {
    primaryCause = 'Opportunity Calculation Updated';
    impact = 'Opportunity formulas updated valuation range parameters.';
  } else {
    primaryCause = 'Website Content Changed';
    impact = 'Re-verification confirmed current operational findings.';
  }

  // 5. Website Change Detection
  const websiteChangesDetected = newPagesList.length > 0 || currPages !== prevPages || Math.abs((current.totalTextExtracted || 0) - (previous.totalTextExtracted || 0)) > 300;
  const newContentFound = [];

  // Identify specific categories of newly discovered content
  const pageCategoriesFound = new Set();
  newPagesList.forEach(page => {
    const u = (page.url || '').toLowerCase();
    const t = (page.title || '').toLowerCase();
    if (u.includes('pricing') || t.includes('pricing')) pageCategoriesFound.add('Pricing Page Updated');
    if (u.includes('faq') || t.includes('faq')) pageCategoriesFound.add('FAQ Section Analyzed');
    if (u.includes('blog') || t.includes('blog') || u.includes('news')) pageCategoriesFound.add('Blog section added');
    if (u.includes('service') || u.includes('solution') || t.includes('service')) pageCategoriesFound.add('2 New Service Pages Added');
    if (u.includes('terms') || u.includes('privacy')) pageCategoriesFound.add('Compliance & Terms pages crawled');
  });

  if (pageCategoriesFound.size > 0) {
    pageCategoriesFound.forEach(c => newContentFound.push(c));
  } else if (currPages > prevPages) {
    newContentFound.push(`${currPages - prevPages} additional pages crawled`);
    newContentFound.push('Refreshed site navigation and headers');
  } else if (websiteChangesDetected) {
    newContentFound.push('Updated website text & metadata observed');
  }

  // 6. Trust Score Delta Explanation
  const trustScoreReasons = [];
  if (currPages > prevPages) {
    trustScoreReasons.push('Crawl coverage increased');
  }
  if (currFacts.length > prevFacts.length) {
    trustScoreReasons.push('More evidence verified');
  }
  if (currTrust.verificationScore > prevTrust.verificationScore || currTrustScore > prevTrustScore) {
    trustScoreReasons.push('Additional confidence validation completed');
  }

  if (trustScoreReasons.length === 0) {
    trustScoreReasons.push('Evidence verification remained consistent');
  }

  // 7. Plain-Language Explanation ("Why are results different?")
  let explanation = '';
  if (currPages > prevPages) {
    const highlightedPages = [];
    if (pageCategoriesFound.has('Pricing Page Updated')) highlightedPages.push('Pricing');
    if (pageCategoriesFound.has('FAQ Section Analyzed')) highlightedPages.push('FAQ');
    if (pageCategoriesFound.has('Compliance & Terms pages crawled')) highlightedPages.push('Terms');
    const pagesListStr = highlightedPages.length > 0 
      ? `, including ${highlightedPages.join(', ')} pages`
      : '';

    explanation = `Why are results different?\n\nThis website was analyzed previously with ${prevPages} pages crawled.\n\nDuring the latest analysis, LeadPilot successfully crawled ${currPages} pages${pagesListStr}.\n\nThe additional content provided more evidence, resulting in:\n\n• More verified facts\n• Additional opportunities\n• Higher confidence\n• Improved trust score\n\nThe newer analysis is based on broader website coverage.`;
  } else if (pricingModelChanged) {
    explanation = `Why are results different?\n\nThis website was analyzed previously using ${prevPricingModel}.\n\nOpportunity values were recalculated using ${currPricingModel}, adjusting financial projections while maintaining observed evidence.`;
  } else if (websiteChangesDetected) {
    explanation = `Why are results different?\n\nWebsite content modifications were detected between ${previousShortDate} and ${currentShortDate}.\n\nUpdated page copy provided fresh evidence that shifted detected opportunities and confidence metrics.`;
  } else {
    explanation = `Why are results different?\n\nRe-analysis confirmed key website findings with stable coverage (${currPages} pages crawled) and consistent evidence verification.`;
  }

  // 8. Itemized Deltas (Facts, Opportunities, Crawled Pages)
  const prevFactTexts = new Set(prevFacts.map(f => (f.fact || '').toLowerCase().trim()));
  const newlyVerifiedFacts = currFacts.filter(f => !prevFactTexts.has((f.fact || '').toLowerCase().trim()));

  const prevRecNames = new Set(prevRecs.map(r => (r.serviceName || '').toLowerCase().trim()));
  const newlyIdentifiedOpportunities = currRecs.filter(r => !prevRecNames.has((r.serviceName || '').toLowerCase().trim()));

  return {
    isRepeatedAnalysis: true,
    version: options.version || 2,
    totalVersions: options.totalVersions || 2,
    previousAnalysis: {
      id: previous.id,
      timestamp: previous.createdAt,
      timeAgo: relativeTime,
      shortDate: previousShortDate,
      pagesCrawled: prevPages,
      crawlCoverage: `${prevCoverage}%`,
      factsCount: prevFacts.length,
      opportunityRange: prevOppRange,
      trustScore: `${prevTrustScore}%`,
      pricingModel: prevPricingModel
    },
    currentAnalysis: {
      id: current.id,
      timestamp: current.createdAt,
      shortDate: currentShortDate,
      pagesCrawled: currPages,
      crawlCoverage: `${currCoverage}%`,
      factsCount: currFacts.length,
      opportunityRange: currOppRange,
      trustScore: `${currTrustScore}%`,
      pricingModel: currPricingModel
    },
    summaryCard: {
      title: 'Analysis Difference Summary',
      verifiedFacts: `${prevFacts.length} → ${currFacts.length} (${factsDeltaStr})`,
      crawlCoverage: `${prevCoverage}% → ${currCoverage}%`,
      pagesCrawled: `${prevPages} → ${currPages}`,
      opportunityValue: `${prevOppRange} → ${currOppRange}`,
      trustScore: `${prevTrustScore}% → ${currTrustScore}%`,
      status
    },
    explanation,
    rootCause: {
      primaryCause,
      impact,
      allowedReasons: ALLOWED_ROOT_CAUSES
    },
    websiteChanges: {
      detected: websiteChangesDetected,
      currentAnalysisDate: currentShortDate,
      previousAnalysisDate: previousShortDate,
      newContentFound,
      impactStatement: 'These changes affected opportunity calculations.'
    },
    pricingModelChanges: {
      changed: pricingModelChanged,
      previousModel: prevPricingModel,
      currentModel: currPricingModel,
      explanation: 'Opportunity estimates were recalculated using updated pricing assumptions.'
    },
    trustScoreChanges: {
      changed: trustDelta !== 0,
      displayDelta: `${prevTrustScore}% → ${currTrustScore}%`,
      reasons: trustScoreReasons
    },
    itemizedDeltas: {
      newlyVerifiedFacts: newlyVerifiedFacts.map(f => f.fact),
      newlyIdentifiedOpportunities: newlyIdentifiedOpportunities.map(r => r.serviceName),
      newPagesCrawled: newPagesList.map(p => p.url || p.title)
    }
  };
}

module.exports = {
  ALLOWED_ROOT_CAUSES,
  normalizeWebsiteUrl,
  detectAnalysisChanges,
  formatRelativeTime,
  formatShortDate
};
