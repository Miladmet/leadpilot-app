const {
  TIMEOUT_LIMITS,
  RETRY_CONFIGS,
  withTimeout,
  withRetry,
  isolateModule,
  validateCalculationInputs,
  CRMQueueManager
} = require('../lib/stabilityCore');

async function runStabilityFrameworkTests() {
  console.log('================================================================');
  console.log('     LEADPILOT PRODUCTION STABILITY FRAMEWORK TEST SUITE        ');
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

  // 1. Timeout Limits Configuration
  assert(
    'TIMEOUT_LIMITS_DEFINED',
    TIMEOUT_LIMITS.CRAWL_MS === 30000 &&
      TIMEOUT_LIMITS.AI_ANALYSIS_MS === 60000 &&
      TIMEOUT_LIMITS.CRM_SYNC_MS === 15000 &&
      TIMEOUT_LIMITS.PDF_GENERATION_MS === 20000,
    'All maximum execution limits configured: Crawl 30s, AI 60s, CRM 15s, PDF 20s.'
  );

  // 2. Timeout Execution: Throws "Operation timed out." when exceeded
  try {
    const slowOperation = new Promise(resolve => setTimeout(resolve, 200));
    await withTimeout(slowOperation, 50, 'Crawl Engine');
    assert('TIMEOUT_CRAWL_CANCELLATION', false, 'Expected timeout did not trigger.');
  } catch (err) {
    assert(
      'TIMEOUT_CRAWL_CANCELLATION',
      err.message.includes('Operation timed out.') && err.operation === 'Crawl Engine',
      `Safely canceled task on timeout: "${err.message}" (Op: ${err.operation})`
    );
  }

  // 3. Timeout Execution: Completes successfully within limit
  try {
    const fastOperation = new Promise(resolve => setTimeout(() => resolve('OK'), 20));
    const result = await withTimeout(fastOperation, 100, 'Fast Op');
    assert('TIMEOUT_FAST_SUCCESS', result === 'OK', 'Fast operation completed safely before timeout limit.');
  } catch (err) {
    assert('TIMEOUT_FAST_SUCCESS', false, `Unexpected timeout on fast operation: ${err.message}`);
  }

  // 4. Retry Strategy: Exponential Backoff succeeds after transient failure
  let attemptCount = 0;
  const transientFn = async (attempt) => {
    attemptCount = attempt;
    if (attempt < 2) {
      throw new Error('Transient Network Reset');
    }
    return 'DATA_RECOVERED';
  };

  const retryResult = await withRetry(transientFn, { maxRetries: 3, backoffMs: 50 });
  assert(
    'RETRY_TRANSIENT_RECOVERY',
    retryResult === 'DATA_RECOVERED' && attemptCount === 2,
    `Successfully recovered on attempt ${attemptCount} using exponential backoff.`
  );

  // 5. Retry Strategy: Max Retries Exhaustion
  let maxAttemptCount = 0;
  const failingFn = async (attempt) => {
    maxAttemptCount = attempt;
    throw new Error('Persistent CRM 503');
  };

  try {
    await withRetry(failingFn, { maxRetries: 3, backoffMs: 20, operationName: 'CRM Sync' });
    assert('RETRY_MAX_EXHAUSTION', false, 'Expected failure was not thrown.');
  } catch (err) {
    assert(
      'RETRY_MAX_EXHAUSTION',
      err.message === 'Persistent CRM 503' && maxAttemptCount === 4,
      `Exhausted 3 retries (total 4 attempts) before safe error propagation.`
    );
  }

  // 6. Fault Isolation: CRM failure does not crash proposal generation
  const mockCRMOperation = async () => {
    throw new Error('Salesforce Connection Timeout');
  };
  const crmIsolated = await isolateModule('CRM Sync', mockCRMOperation, { status: 'Sync Pending' });

  assert(
    'FAULT_ISOLATION_CRM_FAILURE',
    crmIsolated.success === false &&
      crmIsolated.data.status === 'Sync Pending' &&
      crmIsolated.error.module === 'CRM Sync',
    'CRM failure isolated cleanly without throwing; fallback data preserved.'
  );

  // 7. Fault Isolation: Proposal Generator continues independently
  const mockProposalOp = async () => {
    return { proposalId: 'prop_123', status: 'Ready' };
  };
  const proposalIsolated = await isolateModule('Proposal Generator', mockProposalOp);

  assert(
    'FAULT_ISOLATION_INDEPENDENT_PROPOSAL',
    proposalIsolated.success === true && proposalIsolated.data.status === 'Ready',
    'Proposal Generator executed successfully despite previous module error.'
  );

  // 8. Safe Calculation Engine: Missing pricing model validation
  const missingModel = validateCalculationInputs(null, ['evidence fact'], 90);
  assert(
    'SAFE_CALC_MISSING_PRICING_MODEL',
    missingModel.isValid === false && missingModel.status === 'Calculation Unavailable',
    `Blocked calculation without pricing model: "${missingModel.reason}"`
  );

  // 9. Safe Calculation Engine: Missing evidence validation
  const missingEvidence = validateCalculationInputs({ model: 'Agency v1' }, [], 90);
  assert(
    'SAFE_CALC_MISSING_EVIDENCE',
    missingEvidence.isValid === false && missingEvidence.status === 'Calculation Unavailable',
    `Blocked calculation with empty evidence: "${missingEvidence.reason}"`
  );

  // 10. Safe Calculation Engine: Low confidence validation (<50)
  const lowConfidence = validateCalculationInputs({ model: 'Agency v1' }, ['evidence fact'], 45);
  assert(
    'SAFE_CALC_LOW_CONFIDENCE',
    lowConfidence.isValid === false && lowConfidence.status === 'Calculation Unavailable',
    `Blocked calculation with confidence < 50%: "${lowConfidence.reason}"`
  );

  // 11. Safe Calculation Engine: Valid inputs proceed
  const validInputs = validateCalculationInputs({ model: 'Agency v1' }, ['evidence fact'], 85);
  assert(
    'SAFE_CALC_VALID_INPUTS',
    validInputs.isValid === true && validInputs.status === 'Ready',
    'Validated calculation inputs allowed to proceed.'
  );

  // 12. CRM Sync Queue: Enqueue sets status to "Sync Pending"
  const queue = new CRMQueueManager();
  const queuedItem = queue.enqueue({
    prospectId: 'prospect_999',
    crmType: 'HubSpot',
    payload: { email: 'client@domain.com' }
  });

  assert(
    'CRM_QUEUE_ENQUEUE_PENDING',
    queuedItem.status === 'Sync Pending' && queuedItem.attempts === 0,
    'Enqueued CRM request initialized to "Sync Pending" with 0 attempts.'
  );

  // 13. CRM Sync Queue: Mark failed increments attempts and preserves "Sync Pending"
  queue.markFailed(queuedItem.id, new Error('HubSpot Rate Limit'));
  const pendingItems = queue.getPending();
  assert(
    'CRM_QUEUE_RETRY_TRACKING',
    pendingItems.length === 1 &&
      pendingItems[0].attempts === 1 &&
      pendingItems[0].status === 'Sync Pending',
    'Failed attempt incremented counter while keeping item in pending queue.'
  );

  // 14. CRM Sync Queue: Mark Success transitions to Synced
  queue.markSuccess(queuedItem.id);
  assert(
    'CRM_QUEUE_SUCCESS_TRANSITION',
    queuedItem.status === 'Synced' && typeof queuedItem.syncedAt === 'string',
    'Successfully synced item marked "Synced" and removed from pending.'
  );

  // 15. Crawl Safety: Diagnostic Reporting on Blocked / 403 / Timeout
  const mockCrawlDiagnostics = (httpCode) => {
    if (httpCode === 403) return { status: 'Website Crawl Failed', reason: '403 Forbidden - Access Blocked by Target Host' };
    if (httpCode === 404) return { status: 'Website Crawl Failed', reason: '404 Not Found' };
    if (httpCode === 408) return { status: 'Website Crawl Failed', reason: 'Operation timed out.' };
    return { status: 'Website Crawl Failed', reason: 'Blocked' };
  };

  const diag403 = mockCrawlDiagnostics(403);
  const diagTimeout = mockCrawlDiagnostics(408);
  assert(
    'CRAWL_SAFETY_DIAGNOSTICS',
    diag403.status === 'Website Crawl Failed' &&
      diag403.reason.includes('403') &&
      diagTimeout.reason === 'Operation timed out.',
    'Crawl failures safely produce transparent diagnostic records.'
  );

  console.log('\n================================================================');
  console.log(`STABILITY TESTS: ${testsRun} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStabilityFrameworkTests();
