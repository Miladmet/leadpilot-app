/**
 * LeadPilot Analysis Change Detection & Explanation Engine Test Suite
 *
 * Validates versioning, repeated analysis detection, change summary cards,
 * root cause classifications (9 allowed reasons), website change detection,
 * pricing model changes, trust score explanations, and plain-language narratives.
 */

const assert = require('assert');
const {
  ALLOWED_ROOT_CAUSES,
  normalizeWebsiteUrl,
  detectAnalysisChanges,
  formatRelativeTime
} = require('../lib/changeDetectionCore');

console.log('================================================================');
console.log('  TEST SUITE: LeadPilot Analysis Change Detection & Explanation ');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
  try {
    testFn();
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } catch (error) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         Error: ${error.message}`);
    failedTests++;
  }
}

// Mock analysis 1 (Initial run: 6 pages crawled, 5 facts, 89% trust)
const mockAnalysis1 = {
  id: 'prospect-run-1',
  companyName: 'Acme Growth',
  websiteUrl: 'https://acmegrowth.com',
  createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 minutes ago
  pagesCrawledCount: 6,
  crawlCoveragePercent: 71,
  totalTextExtracted: 12000,
  opportunityRange: '$8k-$20k',
  revenueAssumptions: JSON.stringify({ pricingModel: 'Agency Standard v1' }),
  evidenceQuality: 85,
  verificationPassRate: 90,
  findingReliability: 88,
  verifiedFacts: JSON.stringify([
    { fact: 'Uses outdated legacy analytics tag' },
    { fact: 'Missing OpenGraph social meta tags' },
    { fact: 'Hero CTA links to generic mailto instead of scheduling form' },
    { fact: 'Mobile navigation menu button fails to open drawer' },
    { fact: 'SSL certificate expires within 14 days' }
  ]),
  recommendations: JSON.stringify([
    { serviceName: 'Conversion Rate Optimization', estimatedFee: '$4,000' },
    { serviceName: 'Technical SEO & Metadata Overhaul', estimatedFee: '$3,500' }
  ]),
  crawledPagesData: JSON.stringify([
    { url: 'https://acmegrowth.com/', title: 'Home' },
    { url: 'https://acmegrowth.com/about', title: 'About' },
    { url: 'https://acmegrowth.com/services', title: 'Services' },
    { url: 'https://acmegrowth.com/case-studies', title: 'Case Studies' },
    { url: 'https://acmegrowth.com/contact', title: 'Contact' },
    { url: 'https://acmegrowth.com/blog', title: 'Blog' }
  ])
};

// Mock analysis 2 (Repeated run: 10 pages crawled including Pricing, FAQ, Terms; 8 facts, 94% trust, higher opp range)
const mockAnalysis2 = {
  id: 'prospect-run-2',
  companyName: 'Acme Growth',
  websiteUrl: 'https://acmegrowth.com',
  createdAt: new Date().toISOString(), // Just now
  pagesCrawledCount: 10,
  crawlCoveragePercent: 91,
  totalTextExtracted: 26000,
  opportunityRange: '$12k-$44k',
  revenueAssumptions: JSON.stringify({ pricingModel: 'Agency Standard v1' }),
  evidenceQuality: 95,
  verificationPassRate: 98,
  findingReliability: 96,
  verifiedFacts: JSON.stringify([
    { fact: 'Uses outdated legacy analytics tag' },
    { fact: 'Missing OpenGraph social meta tags' },
    { fact: 'Hero CTA links to generic mailto instead of scheduling form' },
    { fact: 'Mobile navigation menu button fails to open drawer' },
    { fact: 'SSL certificate expires within 14 days' },
    { fact: 'Pricing table has unhandled enterprise tier CTA' },
    { fact: 'FAQ section contains broken accordion links' },
    { fact: 'Terms and Privacy policy lack GDPR consent banner' }
  ]),
  recommendations: JSON.stringify([
    { serviceName: 'Conversion Rate Optimization', estimatedFee: '$4,000' },
    { serviceName: 'Technical SEO & Metadata Overhaul', estimatedFee: '$3,500' },
    { serviceName: 'Enterprise Pricing Funnel Architecture', estimatedFee: '$8,000' },
    { serviceName: 'Regulatory Privacy Compliance Package', estimatedFee: '$2,500' }
  ]),
  crawledPagesData: JSON.stringify([
    { url: 'https://acmegrowth.com/', title: 'Home' },
    { url: 'https://acmegrowth.com/about', title: 'About' },
    { url: 'https://acmegrowth.com/services', title: 'Services' },
    { url: 'https://acmegrowth.com/case-studies', title: 'Case Studies' },
    { url: 'https://acmegrowth.com/contact', title: 'Contact' },
    { url: 'https://acmegrowth.com/blog', title: 'Blog' },
    { url: 'https://acmegrowth.com/pricing', title: 'Pricing' },
    { url: 'https://acmegrowth.com/faq', title: 'FAQ' },
    { url: 'https://acmegrowth.com/terms', title: 'Terms' },
    { url: 'https://acmegrowth.com/privacy', title: 'Privacy' }
  ])
};

// 1. Initial Analysis Detection
runTest('INITIAL_ANALYSIS: Returns non-repeated result when no previous analysis exists', () => {
  const result = detectAnalysisChanges(mockAnalysis1, null);
  assert.strictEqual(result.isRepeatedAnalysis, false);
  assert.strictEqual(result.version, 1);
});

// 2. Repeated Analysis Detection
runTest('REPEATED_ANALYSIS: Detects previous analysis with relative time ago', () => {
  const result = detectAnalysisChanges(mockAnalysis2, mockAnalysis1, { version: 2, totalVersions: 2 });
  assert.strictEqual(result.isRepeatedAnalysis, true);
  assert.strictEqual(result.version, 2);
  assert.ok(result.previousAnalysis.timeAgo.includes('minute'), `Expected relative time ago, got: ${result.previousAnalysis.timeAgo}`);
});

// 3. Difference Summary Card Formatting
runTest('SUMMARY_CARD: Formats verified facts, crawl coverage, pages crawled, opp value, trust score, and status', () => {
  const result = detectAnalysisChanges(mockAnalysis2, mockAnalysis1);
  const card = result.summaryCard;
  assert.strictEqual(card.title, 'Analysis Difference Summary');
  assert.strictEqual(card.verifiedFacts, '5 → 8 (+3)');
  assert.strictEqual(card.crawlCoverage, '71% → 91%');
  assert.strictEqual(card.pagesCrawled, '6 → 10');
  assert.strictEqual(card.opportunityValue, '$8k-$20k → $12k-$44k');
  assert.strictEqual(card.status, 'Analysis Improved');
});

// 4. Plain-Language Explanation
runTest('PLAIN_LANGUAGE_EXPLANATION: Generates "Why are results different?" narrative with specific pages', () => {
  const result = detectAnalysisChanges(mockAnalysis2, mockAnalysis1);
  assert.ok(result.explanation.includes('Why are results different?'), 'Missing header');
  assert.ok(result.explanation.includes('successfully crawled 10 pages'), 'Missing page count');
  assert.ok(result.explanation.includes('Pricing'), 'Missing Pricing page attribution');
  assert.ok(result.explanation.includes('More verified facts'), 'Missing bullet for verified facts');
  assert.ok(result.explanation.includes('broader website coverage'), 'Missing coverage rationale');
});

// 5. Allowed Root Cause Validation
runTest('ROOT_CAUSE_ALLOWED_LIST: Primary cause must be member of ALLOWED_ROOT_CAUSES', () => {
  const result = detectAnalysisChanges(mockAnalysis2, mockAnalysis1);
  assert.ok(ALLOWED_ROOT_CAUSES.includes(result.rootCause.primaryCause), `Invalid root cause: ${result.rootCause.primaryCause}`);
  assert.strictEqual(result.rootCause.primaryCause, 'More Pages Crawled');
  assert.strictEqual(result.rootCause.impact, 'Higher confidence and more opportunities detected.');
});

// 6. Pricing Model Change Classification
runTest('PRICING_MODEL_CHANGE: Detects when pricing model changes between runs', () => {
  const analysisWithPricingChange = {
    ...mockAnalysis1,
    id: 'prospect-pricing-change',
    opportunityRange: '$18k-$55k',
    revenueAssumptions: JSON.stringify({ pricingModel: 'Agency Pro v2' })
  };

  const result = detectAnalysisChanges(analysisWithPricingChange, mockAnalysis1);
  assert.strictEqual(result.pricingModelChanges.changed, true);
  assert.strictEqual(result.pricingModelChanges.previousModel, 'Agency Standard v1');
  assert.strictEqual(result.pricingModelChanges.currentModel, 'Agency Pro v2');
  assert.strictEqual(result.rootCause.primaryCause, 'Pricing Model Changed');
  assert.strictEqual(result.rootCause.impact, 'Opportunity estimates were recalculated using updated pricing assumptions.');
});

// 7. Website Changes Detection
runTest('WEBSITE_CHANGES_DETECTED: Identifies new page categories discovered', () => {
  const result = detectAnalysisChanges(mockAnalysis2, mockAnalysis1);
  assert.strictEqual(result.websiteChanges.detected, true);
  assert.ok(result.websiteChanges.newContentFound.length >= 2, 'Expected detected new content categories');
  assert.ok(result.websiteChanges.newContentFound.includes('Pricing Page Updated'), 'Missing Pricing Page category');
});

// 8. Trust Score Change Explanation
runTest('TRUST_SCORE_DELTA: Explains why trust score changed', () => {
  const result = detectAnalysisChanges(mockAnalysis2, mockAnalysis1);
  assert.strictEqual(result.trustScoreChanges.changed, true);
  assert.ok(result.trustScoreChanges.reasons.includes('Crawl coverage increased'), 'Missing coverage reason');
  assert.ok(result.trustScoreChanges.reasons.includes('More evidence verified'), 'Missing evidence reason');
});

// 9. Stable Analysis Detection (No Changes)
runTest('STABLE_ANALYSIS: Flags status as Analysis Stable when metrics match', () => {
  const clone = {
    ...mockAnalysis1,
    id: 'prospect-clone',
    createdAt: new Date().toISOString()
  };
  const result = detectAnalysisChanges(clone, mockAnalysis1);
  assert.strictEqual(result.summaryCard.status, 'Analysis Stable');
  assert.strictEqual(result.summaryCard.verifiedFacts, '5 → 5 (+0)');
  assert.strictEqual(result.summaryCard.pagesCrawled, '6 → 6');
});

// 10. URL Normalization
runTest('URL_NORMALIZATION: Matches URLs regardless of protocol, www, trailing slash, or params', () => {
  const u1 = normalizeWebsiteUrl('https://www.stripe.com/');
  const u2 = normalizeWebsiteUrl('http://stripe.com?ref=google');
  const u3 = normalizeWebsiteUrl('stripe.com');
  assert.strictEqual(u1, 'stripe.com');
  assert.strictEqual(u2, 'stripe.com');
  assert.strictEqual(u3, 'stripe.com');
});

// 11. Itemized Deltas
runTest('ITEMIZED_DELTAS: Extracts newly verified facts and new opportunities', () => {
  const result = detectAnalysisChanges(mockAnalysis2, mockAnalysis1);
  assert.strictEqual(result.itemizedDeltas.newlyVerifiedFacts.length, 3);
  assert.strictEqual(result.itemizedDeltas.newlyIdentifiedOpportunities.length, 2);
  assert.ok(result.itemizedDeltas.newlyIdentifiedOpportunities.includes('Enterprise Pricing Funnel Architecture'));
});

// Summary
console.log('\n================================================================');
console.log(`CHANGE DETECTION TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
