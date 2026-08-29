const { calculateTrustScore, getTrustStatusLevel, REQUIRED_COMPONENTS, TRUST_ENGINE_VERSION } = require('../lib/trustEngineCore');

function runCompleteTrustEngineTestSuite() {
  console.log('================================================================');
  console.log('       LEADPILOT PLATFORM TRUST ENGINE RESILIENCE & SAFETY      ');
  console.log('================================================================\n');

  let testsRun = 0;
  let passed = 0;
  let failed = 0;
  const skipped = 0;

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

  const validBaseline = {
    databaseSecurity: 100,
    verificationEngine: 100,
    storageSecurity: 100,
    tenantIsolation: 100,
    evidenceEngine: 95,
    crawlReliability: 95
  };

  // ==========================================================================
  // SUITE 1: WEIGHTS & INTEGRITY
  // ==========================================================================
  console.log('--- SUITE 1: WEIGHTS & INTEGRITY ---');
  const baselineResult = calculateTrustScore(validBaseline);
  const sumWeights = baselineResult.componentList.reduce((acc, c) => acc + c.weight, 0);
  const sumWeightPercents = baselineResult.componentList.reduce((acc, c) => acc + c.weightPercent, 0);

  assert(
    'WEIGHTS_SUM_TO_100',
    Math.abs(sumWeights - 1.0) < 0.001 && sumWeightPercents === 100,
    `Weights sum exactly to ${(sumWeights * 100).toFixed(0)}% across all 6 controls.`
  );

  assert(
    'ALL_6_COMPONENTS_PRESENT',
    baselineResult.componentList.length === 6 &&
      REQUIRED_COMPONENTS.every(name => baselineResult.componentList.some(c => c.name === name)),
    'All 6 required platform trust components verified.'
  );

  assert(
    'AUDITABILITY_AND_SOURCES',
    baselineResult.componentList.every(c => c.metricSource && c.explanation),
    'Every component includes measurable telemetry source and plain-English explanation.'
  );

  // ==========================================================================
  // SUITE 2: BOUNDARY TESTS
  // ==========================================================================
  console.log('\n--- SUITE 2: BOUNDARY TESTS ---');
  assert('BOUNDARY_100_TRUSTED', getTrustStatusLevel(100) === 'Trusted', '100 maps to Trusted');
  assert('BOUNDARY_95_TRUSTED', getTrustStatusLevel(95) === 'Trusted', '95 maps to Trusted');
  assert('BOUNDARY_94_VERIFIED', getTrustStatusLevel(94) === 'Verified', '94 maps to Verified');
  assert('BOUNDARY_85_VERIFIED', getTrustStatusLevel(85) === 'Verified', '85 maps to Verified');
  assert('BOUNDARY_84_REVIEW', getTrustStatusLevel(84) === 'Review Required', '84 maps to Review Required');
  assert('BOUNDARY_70_REVIEW', getTrustStatusLevel(70) === 'Review Required', '70 maps to Review Required');
  assert('BOUNDARY_69_LOW_CONF', getTrustStatusLevel(69) === 'Low Confidence', '69 maps to Low Confidence');

  // ==========================================================================
  // SUITE 3: DEGRADATION TEST SUITE
  // ==========================================================================
  console.log('\n--- SUITE 3: DEGRADATION TEST SUITE ---');

  // 1. Evidence Engine Degradation: 95 -> 50
  const degEvidence = calculateTrustScore({ ...validBaseline, evidenceEngine: 50 });
  assert(
    'EVIDENCE_ENGINE_DEGRADATION',
    degEvidence.isAvailable &&
      degEvidence.overallScore < baselineResult.overallScore &&
      (degEvidence.components.evidenceEngine.status === 'Warning' || degEvidence.components.evidenceEngine.status === 'Alert'),
    `Score decreased from ${baselineResult.overallScore}% to ${degEvidence.overallScore}%. Status: ${degEvidence.components.evidenceEngine.status}`
  );


  // 2. Verification Engine Degradation: 100 -> 60
  const degVerif = calculateTrustScore({ ...validBaseline, verificationEngine: 60 });
  assert(
    'VERIFICATION_ENGINE_DEGRADATION',
    degVerif.isAvailable &&
      degVerif.overallScore < baselineResult.overallScore &&
      degVerif.components.verificationEngine.explanation.includes('degraded'),
    `Score decreased from ${baselineResult.overallScore}% to ${degVerif.overallScore}%. Reason visible in breakdown.`
  );

  // 3. Database Security Degradation: 100 -> 50
  const degDb = calculateTrustScore({ ...validBaseline, databaseSecurity: 50 });
  assert(
    'DATABASE_SECURITY_DEGRADATION',
    degDb.isAvailable &&
      degDb.overallScore < baselineResult.overallScore &&
      degDb.components.databaseSecurity.status === 'Alert',
    `Score decreased from ${baselineResult.overallScore}% to ${degDb.overallScore}%. Security component highlighted as Alert.`
  );

  // 4. Storage Security Degradation: 100 -> 50
  const degStorage = calculateTrustScore({ ...validBaseline, storageSecurity: 50 });
  assert(
    'STORAGE_SECURITY_DEGRADATION',
    degStorage.isAvailable &&
      degStorage.overallScore < baselineResult.overallScore &&
      degStorage.components.storageSecurity.status === 'Alert',
    `Score decreased from ${baselineResult.overallScore}% to ${degStorage.overallScore}%. Security alert generated.`
  );

  // 5. Tenant Isolation Degradation: 100 -> 70
  const degIsolation = calculateTrustScore({ ...validBaseline, tenantIsolation: 70 });
  assert(
    'TENANT_ISOLATION_DEGRADATION',
    degIsolation.isAvailable &&
      degIsolation.overallScore < baselineResult.overallScore &&
      degIsolation.components.tenantIsolation.explanation.includes('Isolation Alert'),
    `Score decreased from ${baselineResult.overallScore}% to ${degIsolation.overallScore}%. Isolation issue documented.`
  );

  // 6. Crawl Reliability Degradation: 95 -> 25
  const degCrawl = calculateTrustScore({ ...validBaseline, crawlReliability: 25 });
  assert(
    'CRAWL_RELIABILITY_DEGRADATION',
    degCrawl.isAvailable &&
      degCrawl.overallScore < baselineResult.overallScore &&
      degCrawl.components.crawlReliability.explanation.includes('Crawl Reliability Warning'),
    `Score decreased from ${baselineResult.overallScore}% to ${degCrawl.overallScore}%. Warning displayed.`
  );

  // 7. Multi-Component Degradation
  const degMulti = calculateTrustScore({
    databaseSecurity: 60,
    verificationEngine: 65,
    storageSecurity: 70,
    tenantIsolation: 70,
    evidenceEngine: 50,
    crawlReliability: 40
  });
  assert(
    'MULTI_COMPONENT_DEGRADATION',
    degMulti.isAvailable &&
      degMulti.overallScore <= 65 &&
      (degMulti.statusLevel === 'Review Required' || degMulti.statusLevel === 'Low Confidence'),
    `Multi-component degradation handled safely. Overall score: ${degMulti.overallScore}% (${degMulti.statusLevel}). Zero crashes.`
  );

  // ==========================================================================
  // SUITE 4: MISSING COMPONENT TEST SUITE
  // ==========================================================================
  console.log('\n--- SUITE 4: MISSING COMPONENT TEST SUITE ---');

  // 1. Missing Evidence Engine
  const missEvidence = calculateTrustScore({ ...validBaseline, evidenceEngine: null });
  assert(
    'MISSING_EVIDENCE_ENGINE',
    missEvidence.isAvailable === false &&
      missEvidence.status === 'INVALID' &&
      missEvidence.overallScore === null &&
      missEvidence.displayScore === 'Trust Score Unavailable' &&
      missEvidence.missingComponents.includes('Evidence Engine'),
    'Evidence Engine = null -> Calculation blocked, status INVALID, displayScore "Trust Score Unavailable".'
  );

  // 2. Missing Verification Engine
  const missVerif = calculateTrustScore({ ...validBaseline, verificationEngine: undefined });
  assert(
    'MISSING_VERIFICATION_ENGINE',
    missVerif.isAvailable === false &&
      missVerif.status === 'INVALID' &&
      missVerif.missingComponents.includes('Verification Engine'),
    'Verification Engine = undefined -> Calculation blocked, status INVALID.'
  );

  // 3. Missing Database Security
  const missDb = calculateTrustScore({ ...validBaseline, databaseSecurity: null });
  assert(
    'MISSING_DATABASE_SECURITY',
    missDb.isAvailable === false &&
      missDb.status === 'INVALID' &&
      missDb.missingComponents.includes('Database Security'),
    'Database Security = null -> Calculation blocked, status INVALID.'
  );

  // 4. Missing Storage Security
  const missStorage = calculateTrustScore({ ...validBaseline, storageSecurity: null });
  assert(
    'MISSING_STORAGE_SECURITY',
    missStorage.isAvailable === false &&
      missStorage.status === 'INVALID' &&
      missStorage.missingComponents.includes('Storage Security'),
    'Storage Security = null -> Calculation blocked, status INVALID.'
  );

  // 5. Missing Tenant Isolation
  const missIsolation = calculateTrustScore({ ...validBaseline, tenantIsolation: null });
  assert(
    'MISSING_TENANT_ISOLATION',
    missIsolation.isAvailable === false &&
      missIsolation.status === 'INVALID' &&
      missIsolation.missingComponents.includes('Tenant Isolation'),
    'Tenant Isolation = null -> Calculation blocked, status INVALID.'
  );

  // 6. Missing Crawl Reliability
  const missCrawl = calculateTrustScore({ ...validBaseline, crawlReliability: null });
  assert(
    'MISSING_CRAWL_RELIABILITY',
    missCrawl.isAvailable === false &&
      missCrawl.status === 'INVALID' &&
      missCrawl.missingComponents.includes('Crawl Reliability'),
    'Crawl Reliability = null -> Calculation blocked, status INVALID.'
  );

  // 7. Multiple Components Missing
  const missMulti = calculateTrustScore({
    ...validBaseline,
    evidenceEngine: null,
    storageSecurity: null
  });
  assert(
    'MULTIPLE_COMPONENTS_MISSING',
    missMulti.isAvailable === false &&
      missMulti.status === 'INVALID' &&
      missMulti.overallScore === null &&
      missMulti.missingComponents.includes('Evidence Engine') &&
      missMulti.missingComponents.includes('Storage Security'),
    `Multiple missing detected: [${missMulti.missingComponents.join(', ')}]. Trust score not displayed.`
  );

  // ==========================================================================
  // SUITE 5: INVALID VALUE TEST SUITE
  // ==========================================================================
  console.log('\n--- SUITE 5: INVALID VALUE TEST SUITE ---');

  // 1. Value Above 100
  const invAbove = calculateTrustScore({ ...validBaseline, verificationEngine: 120 });
  assert(
    'VALUE_ABOVE_100',
    invAbove.isAvailable === false &&
      invAbove.status === 'INVALID' &&
      invAbove.invalidComponents.some(c => c.name === 'Verification Engine' && c.reason.includes('exceeds maximum 100')),
    'Value 120 -> Validation Failure, calculation blocked.'
  );

  // 2. Negative Value
  const invNeg = calculateTrustScore({ ...validBaseline, databaseSecurity: -10 });
  assert(
    'NEGATIVE_VALUE',
    invNeg.isAvailable === false &&
      invNeg.status === 'INVALID' &&
      invNeg.invalidComponents.some(c => c.name === 'Database Security' && c.reason.includes('negative')),
    'Value -10 -> Validation Failure, calculation blocked.'
  );

  // 3. NaN Value
  const invNaN = calculateTrustScore({ ...validBaseline, crawlReliability: NaN });
  assert(
    'NAN_VALUE',
    invNaN.isAvailable === false &&
      invNaN.status === 'INVALID' &&
      invNaN.invalidComponents.some(c => c.name === 'Crawl Reliability' && c.reason.includes('NaN')),
    'Value NaN -> Validation Failure, calculation blocked.'
  );

  // 4. Non-Numeric Value
  const invStr = calculateTrustScore({ ...validBaseline, storageSecurity: 'unknown' });
  assert(
    'NON_NUMERIC_VALUE',
    invStr.isAvailable === false &&
      invStr.status === 'INVALID' &&
      invStr.invalidComponents.some(c => c.name === 'Storage Security' && c.reason.includes('Non-numeric')),
    'Value "unknown" -> Validation Failure, calculation blocked.'
  );

  // ==========================================================================
  // FINAL REPORT & DEPLOYMENT GATE STATUS
  // ==========================================================================
  console.log('\n================================================================');
  console.log('                 TRUST ENGINE AUDIT REPORT                      ');
  console.log('================================================================');
  console.log(`  Tests Run:             ${testsRun}`);
  console.log(`  Passed:                ${passed}`);
  console.log(`  Failed:                ${failed}`);
  console.log(`  Skipped:               ${skipped}`);
  console.log(`  Trust Engine Status:   ${failed === 0 ? 'Production Ready' : 'DEGRADED / FAILED'}`);
  console.log(`  Trust Engine Version:  ${TRUST_ENGINE_VERSION}`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error('❌ TRUST GATE FAILED: Trust Engine validation errors detected.\n');
    process.exit(1);
  } else {
    console.log('✅ TRUST GATE PASSED: Trust Engine resilience, degradation, and safety verified.\n');
    process.exit(0);
  }
}

runCompleteTrustEngineTestSuite();
