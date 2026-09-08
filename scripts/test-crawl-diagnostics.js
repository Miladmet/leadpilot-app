/**
 * LeadPilot Crawl Coverage Diagnostics Automated Test Suite
 * Validates classification, health tiers, warnings, suppression, and reports.
 */

const assert = require('assert');
const {
  CRAWL_CLASSIFICATIONS,
  COVERAGE_HEALTH_TIERS,
  classifyCrawlFailure,
  getCoverageHealth,
  aggregateTopFailureReasons,
  generateCrawlDiagnosticsReport
} = require('../lib/crawlDiagnosticsCore');

console.log('================================================================');
console.log('       TEST SUITE: Crawl Coverage Diagnostics Engine            ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         ${err.message}\n`);
  }
}

// 1. Classification: 403 Forbidden
runTest('CLASSIFY_403_FORBIDDEN', () => {
  const result = classifyCrawlFailure({ statusCode: 403 });
  assert.strictEqual(result.classification, '403');
  assert.strictEqual(result.statusCode, 403);
  assert.ok(result.failureReason.includes('403'));
});

// 2. Classification: 404 Not Found
runTest('CLASSIFY_404_NOT_FOUND', () => {
  const result = classifyCrawlFailure({ statusCode: 404 });
  assert.strictEqual(result.classification, '404');
  assert.strictEqual(result.statusCode, 404);
  assert.ok(result.failureReason.includes('404'));
});

// 3. Classification: 429 Rate Limited
runTest('CLASSIFY_429_RATE_LIMITED', () => {
  const result = classifyCrawlFailure({ statusCode: 429 });
  assert.strictEqual(result.classification, '429');
  assert.strictEqual(result.statusCode, 429);
  assert.ok(result.failureReason.includes('429'));
});

// 4. Classification: Robots Blocked
runTest('CLASSIFY_ROBOTS_BLOCKED', () => {
  const result = classifyCrawlFailure({ isRobotsBlocked: true });
  assert.strictEqual(result.classification, 'Robots Blocked');
  assert.ok(result.failureReason.toLowerCase().includes('robots'));
});

// 5. Classification: Timeout
runTest('CLASSIFY_TIMEOUT', () => {
  const result1 = classifyCrawlFailure({ errorMessage: 'timeout of 4500ms exceeded' });
  assert.strictEqual(result1.classification, 'Timeout');

  const result2 = classifyCrawlFailure({ errorMessage: 'connect ETIMEDOUT 192.0.2.1:443' });
  assert.strictEqual(result2.classification, 'Timeout');
});

// 6. Classification: JavaScript Required (SPA)
runTest('CLASSIFY_JAVASCRIPT_REQUIRED', () => {
  const spaHtml = '<!DOCTYPE html><html><body><div id="root"></div><noscript>You need to enable JavaScript to run this app.</noscript></body></html>';
  const result = classifyCrawlFailure({
    statusCode: 200,
    html: spaHtml,
    textLength: 0
  });
  assert.strictEqual(result.classification, 'JavaScript Required');
  assert.ok(result.failureReason.includes('JavaScript Required'));
});

// 7. Classification: Redirect Loop
runTest('CLASSIFY_REDIRECT_LOOP', () => {
  const result = classifyCrawlFailure({ errorMessage: 'Max redirects exceeded' });
  assert.strictEqual(result.classification, 'Redirect Loop');
  assert.ok(result.failureReason.includes('Redirect Loop'));
});

// 8. Classification: Unknown
runTest('CLASSIFY_UNKNOWN', () => {
  const result = classifyCrawlFailure({ errorMessage: 'Socket hang up' });
  assert.strictEqual(result.classification, 'Unknown');
});

// 9. Coverage Health Tiers
runTest('COVERAGE_HEALTH_TIERS', () => {
  assert.strictEqual(getCoverageHealth(100).health, 'Excellent');
  assert.strictEqual(getCoverageHealth(92).health, 'Excellent');
  assert.strictEqual(getCoverageHealth(85).health, 'Good');
  assert.strictEqual(getCoverageHealth(75).health, 'Good');
  assert.strictEqual(getCoverageHealth(60).health, 'Moderate');
  assert.strictEqual(getCoverageHealth(50).health, 'Moderate');
  assert.strictEqual(getCoverageHealth(45).health, 'Limited');
  assert.strictEqual(getCoverageHealth(25).health, 'Limited');
  assert.strictEqual(getCoverageHealth(24).health, 'Insufficient');
  assert.strictEqual(getCoverageHealth(5).health, 'Insufficient');
  assert.strictEqual(getCoverageHealth(0).health, 'Insufficient');
});

// 10. Coverage Warning Below 60%
runTest('COVERAGE_WARNING_BELOW_60', () => {
  const repUnder = generateCrawlDiagnosticsReport({ pagesDiscovered: 10, pagesCrawled: 5 }); // 50%
  assert.strictEqual(repUnder.hasCoverageWarning, true);
  assert.ok(repUnder.coverageWarning.includes('below the recommended 60%'));

  const repOver = generateCrawlDiagnosticsReport({ pagesDiscovered: 10, pagesCrawled: 7 }); // 70%
  assert.strictEqual(repOver.hasCoverageWarning, false);
  assert.strictEqual(repOver.coverageWarning, null);
});

// 11. Speculative Opportunity Values Suppressed Below 25%
runTest('SPECULATIVE_SUPPRESSION_BELOW_25', () => {
  const repSuppressed = generateCrawlDiagnosticsReport({ pagesDiscovered: 10, pagesCrawled: 2 }); // 20%
  assert.strictEqual(repSuppressed.isSpeculativeSuppressed, true);
  assert.ok(repSuppressed.suppressionReason.includes('suppressed due to insufficient website coverage'));

  const repAllowed = generateCrawlDiagnosticsReport({ pagesDiscovered: 10, pagesCrawled: 3 }); // 30%
  assert.strictEqual(repAllowed.isSpeculativeSuppressed, false);
  assert.strictEqual(repAllowed.suppressionReason, null);
});

// 12. Top Reasons Pages Were Not Crawled Aggregation
runTest('TOP_REASONS_AGGREGATION', () => {
  const skippedPages = [
    { classification: 'Robots Blocked', failureReason: 'Disallowed' },
    { classification: 'Robots Blocked', failureReason: 'Disallowed' },
    { classification: 'Robots Blocked', failureReason: 'Disallowed' },
    { classification: '403', failureReason: 'Forbidden' },
    { classification: '403', failureReason: 'Forbidden' },
    { classification: 'Timeout', failureReason: 'Timeout' }
  ];

  const topReasons = aggregateTopFailureReasons(skippedPages);
  assert.strictEqual(topReasons.length, 3);
  // Highest frequency first
  assert.strictEqual(topReasons[0].classification, 'Robots Blocked');
  assert.strictEqual(topReasons[0].count, 3);
  assert.strictEqual(topReasons[0].percentage, 50);

  assert.strictEqual(topReasons[1].classification, '403');
  assert.strictEqual(topReasons[1].count, 2);
  assert.strictEqual(topReasons[1].percentage, 33);

  assert.strictEqual(topReasons[2].classification, 'Timeout');
  assert.strictEqual(topReasons[2].count, 1);
  assert.strictEqual(topReasons[2].percentage, 17);
});

// 13. Full Diagnostics Report Structure
runTest('FULL_DIAGNOSTICS_REPORT_INTEGRITY', () => {
  const report = generateCrawlDiagnosticsReport({
    pagesDiscovered: 15,
    pagesCrawled: 12,
    crawlDurationMs: 3400,
    totalTextExtracted: 25000,
    skippedPages: [
      { url: 'https://example.com/admin', statusCode: 403, classification: '403', failureReason: '403 Forbidden' },
      { url: 'https://example.com/dead', statusCode: 404, classification: '404', failureReason: '404 Not Found' },
      { url: 'https://example.com/app', statusCode: 200, classification: 'JavaScript Required', failureReason: 'SPA Shell' }
    ]
  });

  assert.strictEqual(report.pagesDiscovered, 15);
  assert.strictEqual(report.pagesCrawled, 12);
  assert.strictEqual(report.pagesSkipped, 3);
  assert.strictEqual(report.coveragePercentage, 80);
  assert.strictEqual(report.coverageHealth, 'Good');
  assert.strictEqual(report.hasCoverageWarning, false);
  assert.strictEqual(report.isSpeculativeSuppressed, false);
  assert.strictEqual(report.topFailureReasons.length, 3);
  assert.strictEqual(report.skippedPages.length, 3);
});

console.log('================================================================');
console.log(`CRAWL DIAGNOSTICS TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
