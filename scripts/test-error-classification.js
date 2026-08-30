const assert = require('assert');
const { 
  ANALYSIS_ERROR_CODES, 
  classifyAnalysisError, 
  extractPrismaDetails 
} = require('../lib/analysisErrorsCore');

console.log('================================================================');
console.log('RUNNING ADVANCED ERROR CLASSIFICATION & RETRY SAFETY TESTS');
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

// 1. Prisma P2021 (Missing table)
runTest('1. Classifies Prisma P2021 as SCHEMA_MISMATCH with zero retry recommendation', () => {
  const p2021Error = new Error('The table `public.Prospect` does not exist in the current database.');
  p2021Error.code = 'P2021';

  const classified = classifyAnalysisError(p2021Error);
  assert.strictEqual(classified.classification, ANALYSIS_ERROR_CODES.SCHEMA_MISMATCH);
  assert.strictEqual(classified.isRetryable, false);
  assert.strictEqual(classified.referenceCode, 'SCHEMA_MISMATCH');
  assert.ok(classified.userMessage.includes('Analysis could not be saved because the application and database schemas are out of sync.'));
  assert.ok(classified.userMessage.includes('This issue cannot be resolved by retrying.'));
  assert.strictEqual(classified.userMessage.includes('Please retry'), false, 'Must not suggest retrying');
  
  assert.ok(classified.adminDetails);
  assert.strictEqual(classified.adminDetails.prismaErrorCode, 'P2021');
  assert.strictEqual(classified.adminDetails.model, 'Prospect');
  assert.strictEqual(classified.adminDetails.migrationStatus, 'Pending Migration');
});

// 2. Prisma P2022 (Missing column)
runTest('2. Classifies Prisma P2022 as SCHEMA_MISMATCH and extracts missing column for admins', () => {
  const p2022Error = new Error('The column `Prospect.analysisVersion` does not exist in the current database.');
  p2022Error.code = 'P2022';

  const classified = classifyAnalysisError(p2022Error);
  assert.strictEqual(classified.classification, ANALYSIS_ERROR_CODES.SCHEMA_MISMATCH);
  assert.strictEqual(classified.isRetryable, false);
  assert.strictEqual(classified.referenceCode, 'SCHEMA_MISMATCH');
  assert.ok(classified.userMessage.includes('This issue cannot be resolved by retrying.'));
  assert.strictEqual(classified.userMessage.includes('Please retry'), false);

  assert.ok(classified.adminDetails);
  assert.strictEqual(classified.adminDetails.prismaErrorCode, 'P2022');
  assert.strictEqual(classified.adminDetails.model, 'Prospect');
  assert.strictEqual(classified.adminDetails.missingItem, 'analysisVersion');
  assert.strictEqual(classified.adminDetails.migrationStatus, 'Pending Migration');
});

// 3. Network Timeouts -> RETRYABLE
runTest('3. Classifies timeouts as NETWORK_TIMEOUT with "Please retry" recommended', () => {
  const timeoutError = new Error('Connect timeout occurred after 15000ms: ETIMEDOUT');
  const classified = classifyAnalysisError(timeoutError);

  assert.strictEqual(classified.classification, ANALYSIS_ERROR_CODES.NETWORK_TIMEOUT);
  assert.strictEqual(classified.isRetryable, true);
  assert.ok(classified.userMessage.includes('Please retry'));
});

// 4. Network Failures -> RETRYABLE
runTest('4. Classifies connection drops as NETWORK_FAILURE with "Please retry" recommended', () => {
  const connError = new Error('getaddrinfo ENOTFOUND api.target.com');
  const classified = classifyAnalysisError(connError);

  assert.strictEqual(classified.classification, ANALYSIS_ERROR_CODES.NETWORK_FAILURE);
  assert.strictEqual(classified.isRetryable, true);
  assert.ok(classified.userMessage.includes('Please retry'));
});

// 5. Temporary Service Disruption / Rate Limits -> RETRYABLE
runTest('5. Classifies 429 rate limits & 503 service disruption as TEMPORARY_SERVICE_DISRUPTION with retry', () => {
  const rateLimitError = new Error('Google AI Studio Quota Exceeded: 429 Too Many Requests');
  const classified = classifyAnalysisError(rateLimitError);

  assert.strictEqual(classified.classification, ANALYSIS_ERROR_CODES.TEMPORARY_SERVICE_DISRUPTION);
  assert.strictEqual(classified.isRetryable, true);
  assert.ok(classified.userMessage.includes('Please retry in 30-60 seconds'));
});

// 6. Non-retryable Configuration Errors -> NO RETRY
runTest('6. Classifies invalid API key as CONFIGURATION_ERROR without retry recommendation', () => {
  const authKeyError = new Error('API key not valid. Please pass a valid API_KEY');
  const classified = classifyAnalysisError(authKeyError);

  assert.strictEqual(classified.classification, ANALYSIS_ERROR_CODES.CONFIGURATION_ERROR);
  assert.strictEqual(classified.isRetryable, false);
  assert.strictEqual(classified.userMessage.includes('Please retry'), false);
});

// 7. General Scraping Defenses -> NO RETRY
runTest('7. Classifies scraping blocks as GENERAL_ANALYSIS_ERROR without retry recommendation', () => {
  const scrapingBlocked = new Error('Cloudflare Captcha Challenge encountered');
  const classified = classifyAnalysisError(scrapingBlocked);

  assert.strictEqual(classified.classification, ANALYSIS_ERROR_CODES.GENERAL_ANALYSIS_ERROR);
  assert.strictEqual(classified.isRetryable, false);
  assert.strictEqual(classified.userMessage.includes('Please retry'), false);
});

console.log('\n================================================================');
console.log(`ERROR CLASSIFICATION TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
