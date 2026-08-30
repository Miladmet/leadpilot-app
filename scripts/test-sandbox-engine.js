const {
  generateSolutionSandbox,
  validateSandboxEntryConditions,
  SANDBOX_DISCLAIMER,
  SANDBOX_POSITIONING
} = require('../lib/sandboxEngineCore');

function runSandboxEngineTests() {
  console.log('================================================================');
  console.log('      LEADPILOT SOLUTION SANDBOX ENGINE TEST SUITE             ');
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

  const validRecommendations = [
    {
      serviceName: 'Programmatic SEO Hub',
      issue: 'No searchable resource center discovered',
      evidenceList: ['No blog or resource center detected in sitemap'],
      confidence: 94,
      status: 'Verified'
    },
    {
      serviceName: 'Website Redesign',
      issue: 'Complex navigation and delayed primary CTA',
      evidenceList: ['Multiple dense text blocks before primary action button'],
      confidence: 90,
      status: 'Verified'
    }
  ];

  const validProspectContext = {
    companyName: 'Acme Logistics',
    websiteUrl: 'https://acmelogistics.com',
    evidenceQuality: 92,
    findingReliability: 95,
    opportunityRange: '$12,000 - $24,000',
    competitorGaps: [
      { featureName: 'Help Center', prospectStatus: 'Not Detected', competitorStatus: 'Detected on 4 of 5 sites', confidence: 95 },
      { featureName: 'Self-Service Calculator', prospectStatus: 'Not Visible', competitorStatus: 'Detected on 3 of 5 sites', confidence: 90 }
    ]
  };

  const validTrust = {
    isAvailable: true,
    displayScore: '96%',
    status: 'Trusted'
  };

  // 1. Entry Conditions - Valid Inputs
  const validSandbox = generateSolutionSandbox(validRecommendations, validProspectContext, validTrust);

  assert(
    'ENTRY_CONDITIONS_VALID',
    validSandbox.isAvailable === true && validSandbox.status === 'Verified',
    'Sandbox successfully generates when all 4 entry conditions pass.'
  );

  // 2. Entry Conditions - Zero Opportunities Rejection
  const zeroOppSandbox = generateSolutionSandbox([], validProspectContext, validTrust);
  assert(
    'ENTRY_CONDITIONS_ZERO_OPPORTUNITIES',
    zeroOppSandbox.isAvailable === false &&
      zeroOppSandbox.reason.includes('insufficient verified evidence'),
    'Safely blocked when 0 verified opportunities exist.'
  );

  // 3. Entry Conditions - Low Evidence Quality Rejection
  const lowEvidenceSandbox = generateSolutionSandbox(validRecommendations, {
    ...validProspectContext,
    evidenceQuality: 40 // below 50 threshold
  }, validTrust);
  assert(
    'ENTRY_CONDITIONS_LOW_EVIDENCE_QUALITY',
    lowEvidenceSandbox.isAvailable === false &&
      lowEvidenceSandbox.reason.includes('insufficient verified evidence'),
    'Safely blocked when Evidence Quality < 50%.'
  );

  // 4. Entry Conditions - Low Confidence Rejection
  const lowConfidenceSandbox = generateSolutionSandbox(validRecommendations, {
    ...validProspectContext,
    findingReliability: 45 // below 50 threshold
  }, validTrust);
  assert(
    'ENTRY_CONDITIONS_LOW_CONFIDENCE',
    lowConfidenceSandbox.isAvailable === false &&
      lowConfidenceSandbox.reason.includes('insufficient verified evidence'),
    'Safely blocked when Finding Reliability < 50%.'
  );

  // 5. Entry Conditions - Invalid Trust Engine Rejection
  const invalidTrustSandbox = generateSolutionSandbox(validRecommendations, validProspectContext, {
    isAvailable: false,
    status: 'Unavailable'
  });
  assert(
    'ENTRY_CONDITIONS_INVALID_TRUST_ENGINE',
    invalidTrustSandbox.isAvailable === false &&
      invalidTrustSandbox.reason.includes('insufficient verified evidence'),
    'Safely blocked when Platform Trust Engine is unavailable.'
  );

  // 6. Synthesis of All 7 Sandbox Types
  const s = validSandbox.sandboxes;
  assert(
    'ALL_7_SANDBOX_TYPES_PRESENT',
    s &&
      s.websiteRedesign &&
      s.seoContent &&
      s.leadGeneration &&
      s.aiAutomation &&
      s.conversionOptimization &&
      s.pricingLicensing &&
      s.competitorGap,
    'All 7 specialized sandbox models successfully generated.'
  );

  // 7. Website Redesign Content Structure
  assert(
    'WEBSITE_REDESIGN_STRUCTURE',
    s.websiteRedesign.mockHomepageStructure.heroSection.headline.length > 0 &&
      s.websiteRedesign.mockHomepageStructure.suggestedCTAs.suggestedCTA.length > 0 &&
      Array.isArray(s.websiteRedesign.mockHomepageStructure.suggestedNavigation) &&
      s.websiteRedesign.mockHomepageStructure.suggestedLeadCaptureFlow.length > 0,
    'Website Redesign Sandbox contains hero, CTAs, navigation, and lead capture flow.'
  );

  // 8. SEO Content Architecture
  assert(
    'SEO_CONTENT_ARCHITECTURE',
    s.seoContent.sampleContentArchitecture.resourceHub.length > 0 &&
      s.seoContent.sampleContentArchitecture.categories.length >= 3 &&
      s.seoContent.sampleContentArchitecture.suggestedLandingPageStructure.length > 0,
    'SEO Sandbox contains resource hub, categories, and landing page wireframes.'
  );

  // 9. Lead Generation Funnel & Contact Sequence
  assert(
    'LEAD_GEN_FUNNEL_AND_SEQUENCE',
    s.leadGeneration.suggestedLeadFunnel.stage1.length > 0 &&
      s.leadGeneration.contactSequenceExample.length >= 3 &&
      s.leadGeneration.discoveryCallFlow.length >= 5,
    'Lead Gen Sandbox contains multi-stage funnel, contact sequence, and discovery call flow.'
  );

  // 10. AI Automation Workflow Nodes
  assert(
    'AI_AUTOMATION_WORKFLOW',
    s.aiAutomation.potentialAutomationWorkflow.length >= 4 &&
      s.aiAutomation.currentProcess.length > 0 &&
      s.aiAutomation.suggestedProcess.length > 0,
    'AI Automation Sandbox contains current/suggested processes and workflow nodes.'
  );

  // 11. Conversion Optimization Experiments
  assert(
    'CONVERSION_OPTIMIZATION_EXPERIMENTS',
    s.conversionOptimization.currentBlockers.length > 0 &&
      s.conversionOptimization.proposedExperiments.length >= 3 &&
      s.conversionOptimization.frictionReduction.length > 0,
    'Conversion Optimization Sandbox contains blockers, A/B experiments, and friction reduction.'
  );

  // 12. Licensing & Pricing Structure
  assert(
    'LICENSING_PRICING_STRUCTURE',
    s.pricingLicensing.suggestedStructure.length >= 3 &&
      s.pricingLicensing.teamPlans.length > 0 &&
      s.pricingLicensing.licensePackages.length > 0,
    'Licensing Sandbox contains tiered structure (Individual, Team, Agency/Enterprise).'
  );

  // 13. Competitor Gap Capabilities
  assert(
    'COMPETITOR_GAP_CAPABILITIES',
    s.competitorGap.comparisons.length >= 2 &&
      s.competitorGap.comparisons[0].capability.length > 0 &&
      s.competitorGap.comparisons[0].potentialFutureCapability.length > 0,
    'Competitor Gap Sandbox visualizes capability differences and future previews.'
  );

  // 14. Evidence Attribution ("Show Evidence" / "Show Me Why")
  const evidenceChecks = [
    s.websiteRedesign.evidence,
    s.seoContent.evidence,
    s.leadGeneration.evidence,
    s.aiAutomation.evidence,
    s.conversionOptimization.evidence,
    s.pricingLicensing.evidence,
    s.competitorGap.evidence
  ];
  const allHaveEvidence = evidenceChecks.every(
    e => e && e.evidenceUsed && e.sourcePages?.length > 0 && e.confidence && e.reasoning && e.whyGenerated
  );
  assert(
    'SHOW_EVIDENCE_AND_WHY_PANEL',
    allHaveEvidence,
    'Every single sandbox item includes evidenceUsed, sourcePages, confidence, reasoning, and whyGenerated.'
  );

  // 15. Financial Safety: Never Claims Guaranteed Results
  const serialized = JSON.stringify(validSandbox).toLowerCase();
  const hasGuaranteedClaim =
    serialized.includes('guaranteed revenue') ||
    serialized.includes('guaranteed roi') ||
    serialized.includes('guaranteed traffic') ||
    serialized.includes('guaranteed conversions') ||
    serialized.includes('guaranteed ranking');

  assert(
    'FINANCIAL_SAFETY_NO_GUARANTEES',
    hasGuaranteedClaim === false &&
      validSandbox.financialSafety.nonGuaranteeNotice.length > 0,
    'Strict financial safety confirmed: Zero guaranteed outcome claims.'
  );

  // 16. Mandatory Prominent Disclaimer Presence
  assert(
    'MANDATORY_DISCLAIMER_PRESENT',
    validSandbox.disclaimer.includes('conceptual planning tool') &&
      validSandbox.disclaimer.includes('does not guarantee business outcomes'),
    'Prominent sandbox disclaimer verified.'
  );

  console.log('\n================================================================');
  console.log(`SOLUTION SANDBOX TESTS: ${testsRun} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSandboxEngineTests();
