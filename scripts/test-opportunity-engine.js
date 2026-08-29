const {
  calculateServiceOpportunity,
  calculateOpportunityPortfolio,
  PRICING_MODEL,
  STANDARD_ASSUMPTIONS,
  FINANCIAL_DISCLAIMER
} = require('../lib/opportunityEngineCore');

function runOpportunityEngineTests() {
  console.log('================================================================');
  console.log('    LEADPILOT OPPORTUNITY CALCULATION ENGINE TEST SUITE        ');
  console.log('================================================================\n');

  let testsRun = 0;
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details) {
    testsRun++;
    if (condition) {
      passed++;
      console.log(`  [PASS] ${name}: ${details}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${name}: ${details}`);
    }
  }

  // 1. Single Service Calculation & Confidence Weighting
  const single = calculateServiceOpportunity({
    serviceName: 'Programmatic SEO Expansion',
    issue: 'No SEO content hub discovered',
    evidenceList: ['No blog or resource center detected in sitemap'],
    sourcePages: ['Homepage', 'Navigation Structure'],
    estimatedFee: '$10,000 - $20,000',
    confidence: 95
  });

  assert(
    'SINGLE_SERVICE_CONFIDENCE_SCALING',
    single.isAvailable &&
      single.confidenceAdjustment === 0.95 &&
      single.weightedRange.min === 9500 &&
      single.weightedRange.max === 19000 &&
      single.weightedRange.likely === 14250,
    `Base $10k-$20k @ 95% -> Weighted: ${single.weightedRange.formatted} (Likely: $${single.weightedRange.likely})`
  );

  // 2. Multi-Service Aggregation
  const recommendations = [
    {
      serviceName: 'Website Redesign',
      issue: 'Outdated UI and poor mobile layout',
      estimatedFee: '$4,000 - $10,000',
      confidence: 100
    },
    {
      serviceName: 'SEO Setup',
      issue: 'No organic search presence',
      estimatedFee: '$2,500 - $13,000',
      confidence: 100
    },
    {
      serviceName: 'Conversion Optimization',
      issue: 'Weak CTA visibility',
      estimatedFee: '$1,500 - $4,500',
      confidence: 100
    }
  ];

  const portfolio = calculateOpportunityPortfolio(recommendations, {
    evidenceQuality: 92,
    findingReliability: 95
  });

  assert(
    'MULTI_SERVICE_AGGREGATION',
    portfolio.isAvailable &&
      portfolio.portfolio.min === 8000 &&
      portfolio.portfolio.max === 27500 &&
      portfolio.services.length === 3,
    `Sum: Min $${portfolio.portfolio.min}, Likely $${portfolio.portfolio.likely}, Max $${portfolio.portfolio.max}`
  );

  // 3. Pricing Model Attribution
  assert(
    'PRICING_MODEL_ATTRIBUTION',
    portfolio.pricingModel &&
      portfolio.pricingModel.name === 'Agency Standard' &&
      portfolio.pricingModel.version === 'v1.2' &&
      portfolio.pricingModel.currency === 'USD',
    `Model: ${portfolio.pricingModel.name} ${portfolio.pricingModel.version} (${portfolio.pricingModel.currency})`
  );

  // 4. Assumptions Disclosure
  assert(
    'ASSUMPTIONS_EXPOSURE',
    Array.isArray(portfolio.assumptions) &&
      portfolio.assumptions.length >= 4 &&
      portfolio.assumptions.includes('Agency pricing template selected'),
    `Disclosed ${portfolio.assumptions.length} pricing assumptions.`
  );

  // 5. Why This Prospect Card Generation
  assert(
    'WHY_THIS_PROSPECT_CARD',
    portfolio.whyThisProspect &&
      portfolio.whyThisProspect.detectedOpportunitiesCount === 3 &&
      portfolio.whyThisProspect.priority === 'High' &&
      portfolio.whyThisProspect.reasons.length > 0,
    `Why This Prospect: ${portfolio.whyThisProspect.detectedOpportunitiesCount} opps, Priority: ${portfolio.whyThisProspect.priority}`
  );

  // 6. Best Service Recommendation
  assert(
    'BEST_SERVICE_RECOMMENDATION',
    portfolio.bestServiceRecommendation &&
      portfolio.bestServiceRecommendation.serviceName.length > 0 &&
      portfolio.bestServiceRecommendation.estimatedValue.includes('$'),
    `Top Service: ${portfolio.bestServiceRecommendation.serviceName} (${portfolio.bestServiceRecommendation.estimatedValue})`
  );

  // 7. Safety Principle: Low Evidence Quality Rejection
  const blockedLowEvidence = calculateOpportunityPortfolio(recommendations, {
    evidenceQuality: 40, // Below threshold 50
    findingReliability: 95
  });

  assert(
    'VALIDATION_BLOCKED_LOW_EVIDENCE',
    blockedLowEvidence.isAvailable === false &&
      blockedLowEvidence.status === 'Calculation Blocked' &&
      blockedLowEvidence.displayValue === 'Opportunity Value Unavailable' &&
      blockedLowEvidence.reason.includes('Evidence Quality'),
    'Evidence Quality < 50 -> Safely blocked calculation.'
  );

  // 8. Safety Principle: Low Confidence Rejection
  const blockedLowConfidence = calculateServiceOpportunity({
    serviceName: 'Speculative Add-on',
    estimatedFee: '$5,000 - $10,000',
    confidence: 45 // Below threshold 50
  });

  assert(
    'VALIDATION_BLOCKED_LOW_CONFIDENCE',
    blockedLowConfidence.isAvailable === false &&
      blockedLowConfidence.status === 'Calculation Blocked' &&
      blockedLowConfidence.displayValue === 'Opportunity Value Unavailable',
    'Confidence < 50 -> Safely blocked service valuation.'
  );

  // 9. Financial Disclaimer Presence
  assert(
    'FINANCIAL_DISCLAIMER_PRESENT',
    portfolio.disclaimer.includes('estimates based on detected opportunities') &&
      portfolio.disclaimer.includes('not guarantees of revenue'),
    'Financial disclaimer verified.'
  );

  console.log('\n================================================================');
  console.log(`OPPORTUNITY TESTS: ${testsRun} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOpportunityEngineTests();
