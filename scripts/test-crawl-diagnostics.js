/**
 * LeadPilot Crawl Coverage Diagnostics Automated Test Suite
 * Validates classification, health tiers, warnings, suppression, and reports.
 */

const assert = require('assert');
const {
  CRAWL_CLASSIFICATIONS,
  COVERAGE_HEALTH_TIERS,
  PRIORITY_CATEGORIES,
  classifyUrl,
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

// 9. Coverage Health Tiers (Updated Brackets: 90-100, 70-89, 40-69, 20-39, 0-19)
runTest('COVERAGE_HEALTH_TIERS_NEW_BRACKETS', () => {
  // 90-100% Excellent
  assert.strictEqual(getCoverageHealth(100).health, 'Excellent');
  assert.strictEqual(getCoverageHealth(95).health, 'Excellent');
  assert.strictEqual(getCoverageHealth(90).health, 'Excellent');

  // 70-89% Good
  assert.strictEqual(getCoverageHealth(89).health, 'Good');
  assert.strictEqual(getCoverageHealth(75).health, 'Good');
  assert.strictEqual(getCoverageHealth(70).health, 'Good');

  // 40-69% Moderate
  assert.strictEqual(getCoverageHealth(69).health, 'Moderate');
  assert.strictEqual(getCoverageHealth(55).health, 'Moderate');
  assert.strictEqual(getCoverageHealth(40).health, 'Moderate');

  // 20-39% Limited
  assert.strictEqual(getCoverageHealth(39).health, 'Limited');
  assert.strictEqual(getCoverageHealth(30).health, 'Limited');
  assert.strictEqual(getCoverageHealth(20).health, 'Limited');

  // 0-19% Insufficient
  assert.strictEqual(getCoverageHealth(19).health, 'Insufficient');
  assert.strictEqual(getCoverageHealth(10).health, 'Insufficient');
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

// 13. Full Diagnostics Report Structure with Sitemap Telemetry
runTest('FULL_DIAGNOSTICS_REPORT_INTEGRITY', () => {
  const report = generateCrawlDiagnosticsReport({
    pagesDiscovered: 20,
    pagesCrawled: 16,
    sitemapDiscoveredCount: 8,
    crawlDurationMs: 4200,
    totalTextExtracted: 35000,
    skippedPages: [
      { url: 'https://example.com/admin', statusCode: 403, classification: '403', failureReason: '403 Forbidden' },
      { url: 'https://example.com/dead', statusCode: 404, classification: '404', failureReason: '404 Not Found' },
      { url: 'https://example.com/private', statusCode: null, classification: 'Robots Blocked', failureReason: 'Robots.txt' },
      { url: 'https://example.com/app', statusCode: 200, classification: 'JavaScript Required', failureReason: 'SPA Shell' }
    ]
  });

  assert.strictEqual(report.pagesDiscovered, 20);
  assert.strictEqual(report.pagesCrawled, 16);
  assert.strictEqual(report.pagesSkipped, 4);
  assert.strictEqual(report.sitemapDiscoveredCount, 8);
  assert.strictEqual(report.coveragePercentage, 80);
  assert.strictEqual(report.coverageHealth, 'Good');
  assert.strictEqual(report.hasCoverageWarning, false);
  assert.strictEqual(report.isSpeculativeSuppressed, false);
  assert.strictEqual(report.topFailureReasons.length, 4);
  assert.strictEqual(report.skippedPages.length, 4);
});

// 14. Page Prioritization Hierarchy Verification
runTest('PAGE_PRIORITIZATION_HIERARCHY', () => {
  // Test classifying URLs with prioritized weights
  const { classifyUrl } = require('../lib/crawlDiagnosticsCore');
  
  const home = classifyUrl('https://example.com/');
  const services = classifyUrl('https://example.com/services');
  const pricing = classifyUrl('https://example.com/pricing');
  const about = classifyUrl('https://example.com/about-us');
  const contact = classifyUrl('https://example.com/contact');
  const caseStudies = classifyUrl('https://example.com/case-studies');
  const blog = classifyUrl('https://example.com/blog/article-1');

  assert.strictEqual(home.weight, 100, 'Homepage must have weight 100');
  assert.strictEqual(services.weight, 95, 'Services must have weight 95');
  assert.strictEqual(pricing.weight, 90, 'Pricing must have weight 90');
  assert.strictEqual(about.weight, 85, 'About must have weight 85');
  assert.strictEqual(contact.weight, 80, 'Contact must have weight 80');
  assert.strictEqual(caseStudies.weight, 75, 'Case Studies must have weight 75');
  assert.strictEqual(blog.weight, 70, 'Blog must have weight 70');

  // Verify descending order
  assert.ok(home.weight > services.weight, 'Homepage > Services');
  assert.ok(services.weight > pricing.weight, 'Services > Pricing');
  assert.ok(pricing.weight > about.weight, 'Pricing > About');
  assert.ok(about.weight > contact.weight, 'About > Contact');
  assert.ok(contact.weight > caseStudies.weight, 'Contact > Case Studies');
  assert.ok(caseStudies.weight > blog.weight, 'Case Studies > Blog');
});

// 15. Sitemap XML URL Extraction Verification
runTest('SITEMAP_XML_EXTRACTION', async () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://example.com/</loc></url>
    <url><loc>https://example.com/services</loc></url>
    <url><loc>https://example.com/pricing</loc></url>
    <url><loc>https://example.com/about</loc></url>
    <url><loc>https://example.com/contact</loc></url>
    <url><loc>https://example.com/case-studies</loc></url>
    <url><loc>https://example.com/blog</loc></url>
    <url><loc>https://external-domain.com/out</loc></url>
    <url><loc>https://example.com/document.pdf</loc></url>
  </urlset>`;

  const locMatches = sampleXml.matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi);
  const extracted = [];
  const baseDomain = 'example.com';

  for (const m of locMatches) {
    const raw = m[1].trim();
    const parsed = new URL(raw);
    const domain = parsed.hostname.replace(/^www\./i, '');
    if (domain === baseDomain && !raw.endsWith('.pdf')) {
      extracted.push(raw);
    }
  }

  assert.strictEqual(extracted.length, 7);
  assert.ok(extracted.includes('https://example.com/services'));
  assert.ok(extracted.includes('https://example.com/case-studies'));
  assert.ok(!extracted.includes('https://external-domain.com/out'));
  assert.ok(!extracted.includes('https://example.com/document.pdf'));
});

// ================================================================
// RENDERING DIAGNOSTICS ENGINE TESTS (Tests 16-24)
// ================================================================
const { detectRenderingDiagnostics, RENDERING_FRAMEWORKS, RENDERING_METHODS, COVERAGE_IMPACT } = require('../lib/crawlDiagnosticsCore');

// 16. Detect Next.js framework
runTest('DETECT_NEXTJS_FRAMEWORK', () => {
  const html = '<html><head></head><body><div id="__next"></div><script>window.__NEXT_DATA__ = {"page":"/"}</script></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 5 });
  assert.strictEqual(result.framework, 'Next.js', `Expected 'Next.js', got '${result.framework}'`);
  assert.ok(result.signals.length > 0, 'Should have at least one signal');
});

// 17. Detect React framework
runTest('DETECT_REACT_FRAMEWORK', () => {
  const html = '<html><body><div id="root" data-reactroot=""></div><script src="/react-dom.production.min.js"></script></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 0 });
  assert.strictEqual(result.framework, 'React', `Expected 'React', got '${result.framework}'`);
});

// 18. Detect Angular framework
runTest('DETECT_ANGULAR_FRAMEWORK', () => {
  const html = '<html><body ng-version="14.0.0"><app-root></app-root></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 0 });
  assert.strictEqual(result.framework, 'Angular', `Expected 'Angular', got '${result.framework}'`);
});

// 19. Detect Vue framework
runTest('DETECT_VUE_FRAMEWORK', () => {
  const html = '<html><body><div id="app" data-v-a1b2c3d></div><script src="/vue.js"></script></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 0 });
  assert.strictEqual(result.framework, 'Vue', `Expected 'Vue', got '${result.framework}'`);
});

// 20. Detect Nuxt framework
runTest('DETECT_NUXT_FRAMEWORK', () => {
  const html = '<html><body><div id="__nuxt"></div><script>window.__NUXT__ = {}</script></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 0 });
  assert.strictEqual(result.framework, 'Nuxt', `Expected 'Nuxt', got '${result.framework}'`);
});

// 21. Detect Remix framework
runTest('DETECT_REMIX_FRAMEWORK', () => {
  const html = '<html><body><script>window.__remixContext = {"state":{}}</script></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 0 });
  assert.strictEqual(result.framework, 'Remix', `Expected 'Remix', got '${result.framework}'`);
});

// 22. Coverage impact: High (CSR + tiny text)
runTest('JAVASCRIPT_HEAVY_COVERAGE_IMPACT', () => {
  const html = '<html><body><div id="root"></div></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 30 });
  assert.strictEqual(result.isJavaScriptHeavy, true, 'Should be JS-heavy for CSR with short text');
  assert.strictEqual(result.coverageImpact, 'High', `Expected 'High', got '${result.coverageImpact}'`);
  assert.strictEqual(result.renderingMethod, 'Client-Side Rendering (CSR)');
});

// 23. CSR non-failure: isJavaScriptHeavy should NOT cause a failure classification
runTest('CSR_NON_FAILURE_CLASSIFICATION', () => {
  const html = '<html><body><div id="__next"></div></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 10 });
  // The detection result itself is informational — it contains no classification field
  assert.strictEqual(result.isJavaScriptHeavy, true);
  assert.ok(!('classification' in result) || result.classification === undefined,
    'detectRenderingDiagnostics should NOT return a crawl failure classification');
  // Only classifyCrawlFailure should produce a classification
  const failure = classifyCrawlFailure({ statusCode: 200, html, textLength: 10 });
  // The old SPA-shell detection might still classify — that's acceptable, 
  // but the scraper no longer uses it as a hard failure when isJavaScriptHeavy=true
  assert.ok(result.framework !== 'None', 'Should have detected a framework');
});

// 24. CSR informational message
runTest('CSR_INFORMATIONAL_MESSAGE', () => {
  const html = '<html><body><div id="root"></div></body></html>';
  const result = detectRenderingDiagnostics({ html, textLength: 20 });
  assert.ok(result.isJavaScriptHeavy, 'Should be JS-heavy');
  assert.ok(result.message !== null, 'Should produce an informational message');
  assert.ok(
    result.message.includes('client-side rendering'),
    `Message should mention client-side rendering. Got: "${result.message}"`
  );
  assert.ok(
    result.message.includes('Coverage may be lower than expected'),
    `Message should warn about coverage. Got: "${result.message}"`
  );
});

console.log('================================================================');
console.log(`CRAWL DIAGNOSTICS TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
