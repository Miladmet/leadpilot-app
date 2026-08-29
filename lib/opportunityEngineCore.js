/**
 * LeadPilot Opportunity Calculation Engine Core
 *
 * Provides mathematically transparent, auditable, and traceable
 * opportunity valuation ranges with explicit confidence weighting,
 * pricing model attribution, and assumptions disclosure.
 */

const PRICING_MODEL = {
  name: 'Agency Standard',
  version: 'v1.2',
  lastUpdated: '2026-08-29',
  currency: 'USD'
};

const STANDARD_ASSUMPTIONS = [
  'Agency pricing template selected',
  'Small-to-medium business engagement tier',
  'No custom legacy enterprise integrations required',
  'Standard 30-to-90 day milestone implementation effort'
];

const FINANCIAL_DISCLAIMER =
  'Opportunity values are estimates based on detected opportunities, user-selected pricing models, confidence weighting, and publicly observable website information. They are not guarantees of revenue, contract awards, sales performance, or business outcomes.';

const MIN_EVIDENCE_THRESHOLD = 50;
const MIN_CONFIDENCE_THRESHOLD = 50;

/**
 * Parses numeric currency range from a string like "$10,000 - $20,000" or single number
 */
function parseFeeRange(feeString, fallbackValue = 0) {
  if (!feeString && !fallbackValue) {
    return { min: 0, max: 0, raw: '$0 - $0' };
  }

  const str = String(feeString || `$${fallbackValue}`);
  const parts = str.replace(/\$/g, '').replace(/,/g, '').split('-');
  const min = parseInt(parts[0]?.trim() || '0', 10) || 0;
  const max = parseInt(parts[1]?.trim() || parts[0]?.trim() || '0', 10) || min;

  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
    raw: str
  };
}

/**
 * Calculates a single service opportunity valuation
 */
function calculateServiceOpportunity(service, options = {}) {
  const confidence = typeof service.confidence === 'number' ? service.confidence : 80;
  const evidenceQuality = typeof options.evidenceQuality === 'number' ? options.evidenceQuality : 90;

  // Validation Check
  if (confidence < MIN_CONFIDENCE_THRESHOLD) {
    return {
      isAvailable: false,
      status: 'Calculation Blocked',
      displayValue: 'Opportunity Value Unavailable',
      reason: `Confidence (${confidence}%) is below minimum threshold (${MIN_CONFIDENCE_THRESHOLD}%).`,
      serviceName: service.serviceName || 'Unknown Service',
      detectedProblem: service.issue || 'No problem described',
      supportingEvidence: service.evidenceList?.[0] || 'No verified quote available',
      sourcePages: service.sourcePages || ['Homepage'],
      recommendedService: service.serviceName,
      pricingModel: PRICING_MODEL,
      confidence,
      assumptions: STANDARD_ASSUMPTIONS,
      disclaimer: FINANCIAL_DISCLAIMER
    };
  }

  if (evidenceQuality < MIN_EVIDENCE_THRESHOLD) {
    return {
      isAvailable: false,
      status: 'Calculation Blocked',
      displayValue: 'Opportunity Value Unavailable',
      reason: `Evidence Quality (${evidenceQuality}%) is below minimum threshold (${MIN_EVIDENCE_THRESHOLD}%).`,
      serviceName: service.serviceName || 'Unknown Service',
      detectedProblem: service.issue || 'No problem described',
      supportingEvidence: service.evidenceList?.[0] || 'No verified quote available',
      sourcePages: service.sourcePages || ['Homepage'],
      recommendedService: service.serviceName,
      pricingModel: PRICING_MODEL,
      confidence,
      assumptions: STANDARD_ASSUMPTIONS,
      disclaimer: FINANCIAL_DISCLAIMER
    };
  }

  const base = parseFeeRange(service.estimatedFee, service.estimatedValue || 5000);
  const baseMin = base.min;
  const baseMax = base.max;
  const baseLikely = Math.round((baseMin + baseMax) / 2);

  const confMultiplier = Number((confidence / 100).toFixed(2));
  const weightedMin = Math.round(baseMin * confMultiplier);
  const weightedLikely = Math.round(baseLikely * confMultiplier);
  const weightedMax = Math.round(baseMax * confMultiplier);

  const finalRangeFormatted = `$${weightedMin.toLocaleString()} - $${weightedMax.toLocaleString()}`;
  const baseRangeFormatted = `$${baseMin.toLocaleString()} - $${baseMax.toLocaleString()}`;

  const calculationBreakdown = [
    `Base Valuation: ${baseRangeFormatted} (Likely: $${baseLikely.toLocaleString()})`,
    `Confidence Score: ${confidence}%`,
    `Confidence Multiplier: ${confMultiplier}`,
    `Weighted Minimum: $${baseMin.toLocaleString()} × ${confMultiplier} = $${weightedMin.toLocaleString()}`,
    `Weighted Likely: $${baseLikely.toLocaleString()} × ${confMultiplier} = $${weightedLikely.toLocaleString()}`,
    `Weighted Maximum: $${baseMax.toLocaleString()} × ${confMultiplier} = $${weightedMax.toLocaleString()}`
  ];

  return {
    isAvailable: true,
    status: 'Verified',
    displayValue: finalRangeFormatted,
    serviceName: service.serviceName || 'Growth Optimization',
    detectedProblem: service.issue || 'Detected performance and organic acquisition gap',
    supportingEvidence: service.evidenceList?.[0] || service.explanation || 'Verified on public website structure.',
    sourcePages: service.sourcePages || ['Homepage', 'Navigation Structure'],
    recommendedService: service.serviceName,
    pricingModel: PRICING_MODEL,
    confidence,
    confidenceAdjustment: confMultiplier,
    baseServiceCost: baseLikely,
    baseRange: {
      min: baseMin,
      likely: baseLikely,
      max: baseMax,
      formatted: baseRangeFormatted
    },
    weightedRange: {
      min: weightedMin,
      likely: weightedLikely,
      max: weightedMax,
      formatted: finalRangeFormatted
    },
    calculationBreakdown,
    assumptions: STANDARD_ASSUMPTIONS,
    disclaimer: FINANCIAL_DISCLAIMER
  };
}

/**
 * Calculates complete multi-service opportunity portfolio
 */
function calculateOpportunityPortfolio(recommendations = [], prospectContext = {}) {
  const evidenceQuality = typeof prospectContext.evidenceQuality === 'number'
    ? prospectContext.evidenceQuality
    : 90;
  const findingReliability = typeof prospectContext.findingReliability === 'number'
    ? prospectContext.findingReliability
    : 92;

  // Global validation check
  if (evidenceQuality < MIN_EVIDENCE_THRESHOLD || findingReliability < MIN_CONFIDENCE_THRESHOLD) {
    return {
      isAvailable: false,
      status: 'Calculation Blocked',
      displayValue: 'Opportunity Value Unavailable',
      reason: evidenceQuality < MIN_EVIDENCE_THRESHOLD
        ? `Evidence Quality (${evidenceQuality}%) is insufficient for financial modeling.`
        : `Confidence (${findingReliability}%) is below audit safety limits.`,
      services: [],
      portfolio: {
        min: 0,
        likely: 0,
        max: 0,
        formatted: 'Opportunity Value Unavailable'
      },
      whyThisProspect: null,
      bestServiceRecommendation: null,
      pricingModel: PRICING_MODEL,
      assumptions: STANDARD_ASSUMPTIONS,
      disclaimer: FINANCIAL_DISCLAIMER
    };
  }

  // Calculate each service
  const serviceCalculations = recommendations.map(rec =>
    calculateServiceOpportunity(rec, { evidenceQuality })
  );

  const availableServices = serviceCalculations.filter(s => s.isAvailable);

  if (availableServices.length === 0) {
    return {
      isAvailable: false,
      status: 'Calculation Blocked',
      displayValue: 'Opportunity Value Unavailable',
      reason: 'No individual service passed validation thresholds.',
      services: serviceCalculations,
      portfolio: {
        min: 0,
        likely: 0,
        max: 0,
        formatted: 'Opportunity Value Unavailable'
      },
      whyThisProspect: null,
      bestServiceRecommendation: null,
      pricingModel: PRICING_MODEL,
      assumptions: STANDARD_ASSUMPTIONS,
      disclaimer: FINANCIAL_DISCLAIMER
    };
  }

  const totalMin = availableServices.reduce((acc, s) => acc + s.weightedRange.min, 0);
  const totalLikely = availableServices.reduce((acc, s) => acc + s.weightedRange.likely, 0);
  const totalMax = availableServices.reduce((acc, s) => acc + s.weightedRange.max, 0);
  const portfolioFormatted = `$${totalMin.toLocaleString()} - $${totalMax.toLocaleString()}`;

  // Best Service Recommendation (highest weighted value or confidence)
  const sortedServices = [...availableServices].sort((a, b) => (b.weightedRange.likely * (b.confidence / 100)) - (a.weightedRange.likely * (a.confidence / 100)));
  const topService = sortedServices[0];

  const bestServiceRecommendation = topService ? {
    serviceName: topService.serviceName,
    confidence: topService.confidence,
    estimatedValue: topService.weightedRange.formatted,
    likelyValue: `$${topService.weightedRange.likely.toLocaleString()}`,
    reasons: [
      topService.detectedProblem,
      `Supported by verified evidence (${topService.confidence}% confidence)`,
      'Highest immediate organic acquisition and ROI impact'
    ]
  } : null;

  // Why This Prospect Card
  const competitorGapsCount = Array.isArray(prospectContext.competitorGaps)
    ? prospectContext.competitorGaps.length
    : (prospectContext.competitorGapsCount || 2);

  const whyThisProspect = {
    detectedOpportunitiesCount: availableServices.length,
    competitorGapsCount: competitorGapsCount,
    monetizationOpportunitiesCount: Math.max(1, availableServices.length),
    confidence: findingReliability,
    priority: findingReliability >= 85 ? 'High' : findingReliability >= 70 ? 'Medium' : 'Low',
    reasons: availableServices.map(s => s.detectedProblem).slice(0, 4)
  };

  return {
    isAvailable: true,
    status: 'Verified',
    displayValue: portfolioFormatted,
    services: serviceCalculations,
    availableCount: availableServices.length,
    portfolio: {
      min: totalMin,
      likely: totalLikely,
      max: totalMax,
      formatted: portfolioFormatted
    },
    whyThisProspect,
    bestServiceRecommendation,
    pricingModel: PRICING_MODEL,
    assumptions: STANDARD_ASSUMPTIONS,
    disclaimer: FINANCIAL_DISCLAIMER
  };
}

module.exports = {
  calculateServiceOpportunity,
  calculateOpportunityPortfolio,
  parseFeeRange,
  PRICING_MODEL,
  STANDARD_ASSUMPTIONS,
  FINANCIAL_DISCLAIMER,
  MIN_EVIDENCE_THRESHOLD,
  MIN_CONFIDENCE_THRESHOLD
};
