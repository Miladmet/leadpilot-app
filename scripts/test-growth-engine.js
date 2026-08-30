/**
 * Test Suite: LeadPilot Traffic Growth Engine
 * Validates Programmatic SEO keywords, Free Tools calculators, Social Content Generator,
 * YouTube/Blog idea generator, Referral system, Case studies, and Public audit sharing.
 */

const assert = require('assert');
const {
  calculateProposalValue,
  calculateAgencyPricing,
  generateQuickOpportunityScan,
  generateQuickSeoGapCheck,
  generateQuickCompetitorGapSnapshot,
  generateLinkedInPost,
  generateTwitterThread,
  generateAgencyTips,
  generateWebsiteTeardown,
  generateOpportunityDiscoveryPost,
  generateContentIdeas,
  generateReferralCode,
  getReferralRewardTiers,
  sanitizePublicAudit
} = require('../lib/growthEngineCore');

console.log('================================================================');
console.log('       TEST SUITE: LeadPilot Traffic Growth Engine             ');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

// 1. Programmatic SEO Keywords
runTest('SEO_KEYWORDS_VALIDATION: 10 Target Keywords Configured', () => {
  const { SEO_KEYWORDS } = require('../lib/seoKeywordsCore');
  const requiredSlugs = [
    'website-audit-tool',
    'seo-proposal-generator',
    'agency-prospecting-tool',
    'lead-generation-for-agencies',
    'client-acquisition-software',
    'website-opportunity-analysis',
    'ai-proposal-generator',
    'competitor-gap-analysis',
    'ai-agency-software',
    'prospect-research-tool'
  ];

  assert.strictEqual(Object.keys(SEO_KEYWORDS).length, 10, 'Expected exactly 10 programmatic SEO keywords');
  
  requiredSlugs.forEach(slug => {
    const kw = SEO_KEYWORDS[slug];
    assert(kw, `Missing keyword config for slug: ${slug}`);
    assert(kw.title && kw.title.length > 10, `${slug} must have valid SEO title`);
    assert(kw.metaDescription && kw.metaDescription.length > 30, `${slug} must have meta description`);
    assert(Array.isArray(kw.faqs) && kw.faqs.length >= 2, `${slug} must have at least 2 FAQs`);
    assert(Array.isArray(kw.relatedSlugs) && kw.relatedSlugs.length >= 2, `${slug} must have internal links`);
  });
});

// 2. Proposal Value Calculator
runTest('PROPOSAL_VALUE_CALCULATOR: Calculates Initial Fee and Annual Contract Value', () => {
  const result = calculateProposalValue(4, 5000, 2500);
  assert(result.initialProjectFee > 0, 'Initial fee must be positive');
  assert.strictEqual(result.monthlyRetainer, 2500);
  assert.strictEqual(result.annualContractValue, result.initialProjectFee + (2500 * 12));
  assert(result.formattedInitial.includes('$'), 'Formatted initial must have currency symbol');
  assert(result.formattedAnnual.includes('$'), 'Formatted annual must have currency symbol');
});

// 3. Agency Pricing Calculator
runTest('AGENCY_PRICING_CALCULATOR: Computes Target Margins and Retainers', () => {
  const result = calculateAgencyPricing('Standard', 60, 20, 100);
  // Cost = 20 * 100 = 2000. Price with 60% margin = 2000 / (1 - 0.6) = 5000
  assert.strictEqual(result.baseCost, 2000);
  assert.strictEqual(result.recommendedProjectFee, 5000);
  assert.strictEqual(result.grossProfit, 3000);
  assert.strictEqual(result.targetMarginPercent, 60);
});

// 4. Quick Opportunity Scanner
runTest('OPPORTUNITY_SCANNER: Generates Instant Free Preview Gaps', () => {
  const scan = generateQuickOpportunityScan('acmecorp.com');
  assert.strictEqual(scan.domain, 'acmecorp.com');
  assert(scan.overallOpportunityScore >= 70, 'Opportunity score must be calculated');
  assert(Array.isArray(scan.topOpportunities) && scan.topOpportunities.length >= 3, 'Must have at least 3 sample opportunities');
  assert.strictEqual(scan.isFreePreview, true);
});

// 5. Quick SEO Gap Checker
runTest('SEO_GAP_CHECKER: Surfaces Critical Gaps and Quick Wins', () => {
  const check = generateQuickSeoGapCheck('nike.com');
  assert.strictEqual(check.domain, 'nike.com');
  assert(Array.isArray(check.criticalGaps) && check.criticalGaps.length >= 3);
  assert(Array.isArray(check.quickWins) && check.quickWins.length >= 2);
  assert(check.potentialTrafficIncrease.includes('%'));
});

// 6. Quick Competitor Gap Snapshot
runTest('COMPETITOR_SNAPSHOT: Generates Market Benchmark & Pitch Angle', () => {
  const snapshot = generateQuickCompetitorGapSnapshot('stripe.com');
  assert.strictEqual(snapshot.domain, 'stripe.com');
  assert(snapshot.competitorBenchmarkScore > 0);
  assert(Array.isArray(snapshot.gapsVsCategoryLeaders) && snapshot.gapsVsCategoryLeaders.length >= 3);
  assert(snapshot.pitchAngle.includes('stripe.com'));
});

// 7. Social Content Generator
runTest('SOCIAL_CONTENT_GENERATOR: Formats LinkedIn, Twitter, Tips, and Teardowns', () => {
  const mockProspect = {
    companyName: 'Linear Technologies',
    websiteUrl: 'https://linear.app',
    opportunityRange: '$18,000 - $45,000',
    factsVerifiedCount: 7
  };

  const liPost = generateLinkedInPost(mockProspect);
  assert(liPost.includes('Linear Technologies'), 'LinkedIn post must mention company');
  assert(liPost.includes('$18,000 - $45,000'), 'LinkedIn post must include opportunity range');

  const tweet = generateTwitterThread(mockProspect);
  assert(tweet.includes('1/4'), 'Tweet thread must format numbered tweets');
  assert(tweet.includes('Linear Technologies'));

  const tip = generateAgencyTips(mockProspect);
  assert(tip.includes('Linear Technologies'));
  assert(tip.includes('Platform Trust Score'));

  const teardown = generateWebsiteTeardown(mockProspect);
  assert(teardown.includes('[Video Script:'));
  assert(teardown.includes('(0:00 - 0:10)'));

  const discovery = generateOpportunityDiscoveryPost(mockProspect);
  assert(discovery.includes('Linear Technologies'));
});

// 8. YouTube & Blog Content Ideas Generator
runTest('CONTENT_IDEAS_GENERATOR: Generates the 4 Required Video & Blog Outlines', () => {
  const mockProspect = {
    companyName: 'Figma',
    websiteUrl: 'https://figma.com',
    opportunityRange: '$44,000'
  };

  const ideas = generateContentIdeas(mockProspect);
  assert.strictEqual(ideas.length, 4, 'Must generate exactly 4 content ideas');

  const titles = ideas.map(i => i.title);
  assert(titles.some(t => t.includes('5 Opportunities We Found On Figma')), 'Missing idea 1');
  assert(titles.some(t => t.includes('How Agencies Can Turn Website Audits Into Clients')), 'Missing idea 2');
  assert(titles.some(t => t.includes('Competitor Gap Analysis Explained')), 'Missing idea 3');
  assert(titles.some(t => t.includes('How We Identified $44,000 In Potential Services')), 'Missing idea 4');

  ideas.forEach(idea => {
    assert(idea.hook && idea.hook.length > 10, 'Idea must have a compelling hook');
    assert(Array.isArray(idea.outline) && idea.outline.length >= 4, 'Idea must have at least 4 outline points');
  });
});

// 9. Referral System Engine
runTest('REFERRAL_SYSTEM: Generates Custom Code & 3 Reward Tracks', () => {
  const code = generateReferralCode('user-uuid-12345');
  assert(code.startsWith('LP-'), 'Referral code must have LP- prefix');

  const tiers = getReferralRewardTiers();
  assert.strictEqual(tiers.length, 3, 'Must have 3 referral reward tracks');
  
  const tracks = tiers.map(t => t.track);
  assert(tracks.includes('Refer an Agency'));
  assert(tracks.includes('Refer a Consultant'));
  assert(tracks.includes('Refer a Freelancer'));
});

// 10. Public Audit Sanitizer
runTest('PUBLIC_AUDIT_SANITIZER: Sanitizes Client Reports with Trust & CTAs', () => {
  const rawProspect = {
    id: 'prop-9988',
    companyName: 'Test Agency Target',
    websiteUrl: 'https://testagency.com',
    opportunityRange: '$10,000 - $30,000',
    evidenceQuality: 92,
    verificationPassRate: 95,
    pagesCrawledCount: 7,
    crawlCoveragePercent: 90,
    executiveSummary: 'Public executive summary test.',
    recommendations: JSON.stringify([{ service: 'CRO', estimatedFee: '$5,000' }]),
    competitorGaps: JSON.stringify([{ area: 'Speed', status: 'Slower than rivals' }]),
    verifiedFacts: JSON.stringify([{ fact: 'Uses WordPress 6.4' }]),
    // Sensitive internal fields that should NOT be in sanitized output
    internalNotes: 'Confidential agency note',
    rawTokenLogs: 'secret-token-123'
  };

  const sanitized = sanitizePublicAudit(rawProspect);
  assert.strictEqual(sanitized.id, 'prop-9988');
  assert.strictEqual(sanitized.companyName, 'Test Agency Target');
  assert.strictEqual(sanitized.trustScore, 92);
  assert.strictEqual(sanitized.opportunityRange, '$10,000 - $30,000');
  assert.strictEqual(sanitized.internalNotes, undefined, 'Must not leak internalNotes');
  assert.strictEqual(sanitized.rawTokenLogs, undefined, 'Must not leak rawTokenLogs');
});

// 11. Case Studies Dataset Validation
runTest('CASE_STUDIES: Contains Real Problem, Opportunity, Solution & ROI Metrics', () => {
  const { CASE_STUDIES } = require('../lib/caseStudiesCore');
  const studies = Object.values(CASE_STUDIES);
  assert(studies.length >= 3, 'Must have at least 3 case studies');

  studies.forEach(study => {
    assert(study.slug && study.slug.length > 3);
    assert(study.companyName && study.companyName.length > 2);
    assert(study.opportunityValue && study.opportunityValue.includes('$'));
    assert(Array.isArray(study.problemsFound) && study.problemsFound.length >= 3);
    assert(Array.isArray(study.opportunitiesFound) && study.opportunitiesFound.length >= 3);
    assert(Array.isArray(study.suggestedSolutions) && study.suggestedSolutions.length >= 3);
    assert(study.beforeAfter && study.beforeAfter.revenueLift);
    assert(study.agencyRoi && study.agencyRoi.closedRetainer);
  });
});

console.log('\n================================================================');
console.log(`GROWTH ENGINE TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
