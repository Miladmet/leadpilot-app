const { calculateTrustScore, getTrustStatusLevel } = require('../lib/trustEngineCore');

function runTrustEngineTests() {
  console.log('================================================================');
  console.log('       LEADPILOT PLATFORM TRUST ENGINE TEST RUNNER              ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details) {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${name}: ${details}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${name}: ${details}`);
    }
  }

  // 1. Test Weights Sum to 100%
  const defaultResult = calculateTrustScore();
  const sumWeights = defaultResult.componentList.reduce((acc, c) => acc + c.weight, 0);
  const sumWeightPercents = defaultResult.componentList.reduce((acc, c) => acc + c.weightPercent, 0);
  assert(
    'WEIGHTS_SUM_TO_100',
    Math.abs(sumWeights - 1.0) < 0.001 && sumWeightPercents === 100,
    `Component weights sum to ${(sumWeights * 100).toFixed(0)}% across all 6 controls.`
  );

  // 2. Test 6 Components Present
  const requiredComponents = [
    'Database Security',
    'Verification Engine',
    'Storage Security',
    'Tenant Isolation',
    'Evidence Engine',
    'Crawl Reliability'
  ];
  const allPresent = requiredComponents.every(name =>
    defaultResult.componentList.some(c => c.name === name)
  );
  assert(
    'ALL_6_COMPONENTS_PRESENT',
    allPresent && defaultResult.componentList.length === 6,
    'All 6 required platform trust components verified.'
  );

  // 3. Status Level Boundaries
  assert('BOUNDARY_100_TRUSTED', getTrustStatusLevel(100) === 'Trusted', '100 maps to Trusted');
  assert('BOUNDARY_95_TRUSTED', getTrustStatusLevel(95) === 'Trusted', '95 maps to Trusted');
  assert('BOUNDARY_94_VERIFIED', getTrustStatusLevel(94) === 'Verified', '94 maps to Verified');
  assert('BOUNDARY_85_VERIFIED', getTrustStatusLevel(85) === 'Verified', '85 maps to Verified');
  assert('BOUNDARY_84_REVIEW', getTrustStatusLevel(84) === 'Review Required', '84 maps to Review Required');
  assert('BOUNDARY_70_REVIEW', getTrustStatusLevel(70) === 'Review Required', '70 maps to Review Required');
  assert('BOUNDARY_69_LOW_CONF', getTrustStatusLevel(69) === 'Low Confidence', '69 maps to Low Confidence');

  // 4. Test Mathematical Determinism and Weighted Points
  const customResult = calculateTrustScore({
    rlsCoveragePercent: 100, // 20 pts
    verificationPassRate: 80, // 16 pts
    storageSecurityScore: 100, // 15 pts
    tenantIsolationPassRate: 100, // 15 pts
    evidenceQuality: 70, // 10.5 pts
    crawlCoveragePercent: 60, // 9.0 pts
  });
  // Expected: 20 + 16 + 15 + 15 + 10.5 + 9 = 85.5 -> round(85.5) = 86 -> 'Verified'
  assert(
    'MATHEMATICAL_CALCULATION',
    customResult.overallScore === 86 && customResult.statusLevel === 'Verified',
    `Expected 86 (Verified), calculated ${customResult.overallScore} (${customResult.statusLevel})`
  );

  // 5. Test Auditability & Metric Sources
  const allAuditable = customResult.componentList.every(
    c => c.metricSource && c.metricSource.length > 5 && c.explanation && c.explanation.length > 10
  );
  assert(
    'AUDITABILITY_AND_SOURCES',
    allAuditable,
    'Every trust component includes measurable telemetry source and plain-English explanation.'
  );

  console.log('\n================================================================');
  console.log(`TRUST ENGINE TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTrustEngineTests();
