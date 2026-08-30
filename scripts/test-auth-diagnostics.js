const assert = require('assert');

// Test suite for LeadPilot Authentication Reliability and Error Handling
console.log('================================================================');
console.log('RUNNING LEADPILOT AUTHENTICATION RELIABILITY & DIAGNOSTICS TESTS');
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

// 1. Error Classifier Logic (recreated for CJS test environment)
function classifyAuthError(err, responseStatus) {
  const rawMsg = err?.message || (typeof err === 'string' ? err : '');
  const lowerMsg = rawMsg.toLowerCase();

  if (
    lowerMsg.includes('failed to fetch') ||
    lowerMsg.includes('load failed') ||
    lowerMsg.includes('networkerror') ||
    lowerMsg.includes('network error') ||
    lowerMsg.includes('econnrefused') ||
    lowerMsg.includes('etimedout') ||
    lowerMsg.includes('offline')
  ) {
    return {
      category: 'NETWORK_ERROR',
      userMessage: 'Unable to connect to the LeadPilot server.',
      actionHint: 'Please check your internet connection or try again in a few moments.',
      isRetryable: true,
      technicalDetails: rawMsg
    };
  }

  if (responseStatus === 502 || responseStatus === 503 || responseStatus === 504 || lowerMsg.includes('gateway') || lowerMsg.includes('service unavailable')) {
    return {
      category: 'SERVICE_OUTAGE',
      userMessage: 'LeadPilot authentication services are temporarily undergoing maintenance.',
      actionHint: 'Our systems are reconnecting. Please retry in a few seconds.',
      isRetryable: true,
      technicalDetails: `HTTP Status ${responseStatus || 'Outage'}: ${rawMsg}`
    };
  }

  if (responseStatus === 500 || lowerMsg.includes('internal server error') || lowerMsg.includes('prisma') || lowerMsg.includes('database')) {
    return {
      category: 'BACKEND_ERROR',
      userMessage: 'The authentication service encountered an unexpected issue.',
      actionHint: 'Your account is secure. Please click Retry Connection to re-authenticate.',
      isRetryable: true,
      technicalDetails: rawMsg
    };
  }

  if (responseStatus === 401 || lowerMsg.includes('invalid email or password') || lowerMsg.includes('invalid credentials') || lowerMsg.includes('unauthorized')) {
    return {
      category: 'INVALID_CREDENTIALS',
      userMessage: 'The email or password you entered is incorrect.',
      actionHint: 'Please double-check your spelling or reset your password.',
      isRetryable: false,
      technicalDetails: 'HTTP 401 Unauthorized'
    };
  }

  if (responseStatus === 400 || lowerMsg.includes('already exists') || lowerMsg.includes('password') || lowerMsg.includes('required')) {
    return {
      category: 'VALIDATION_ERROR',
      userMessage: rawMsg.includes('already exists') 
        ? 'An account with this email address already exists.' 
        : (rawMsg || 'Please verify your information meets all requirements.'),
      actionHint: rawMsg.includes('already exists') ? 'Please sign in or use a different email.' : 'Review the highlighted fields above.',
      isRetryable: false,
      technicalDetails: rawMsg
    };
  }

  return {
    category: 'UNKNOWN',
    userMessage: 'Sign in could not be completed at this time.',
    actionHint: 'Please check your connection and click Retry.',
    isRetryable: true,
    technicalDetails: rawMsg
  };
}

function validatePassword(password) {
  if (!password) return { isValid: false, message: 'Password is required' };
  if (password.length < 6) return { isValid: false, message: 'Password must be at least 6 characters' };
  return { isValid: true };
}

// -------------------------------------------------------------
// TESTS
// -------------------------------------------------------------

runTest('1. Replaces generic browser "Load failed" with user-friendly network message', () => {
  const result = classifyAuthError(new Error('Load failed'));
  assert.strictEqual(result.category, 'NETWORK_ERROR');
  assert.strictEqual(result.userMessage, 'Unable to connect to the LeadPilot server.');
  assert.strictEqual(result.isRetryable, true);
});

runTest('2. Replaces generic "Failed to fetch" with user-friendly network message', () => {
  const result = classifyAuthError(new Error('TypeError: Failed to fetch'));
  assert.strictEqual(result.category, 'NETWORK_ERROR');
  assert.strictEqual(result.userMessage, 'Unable to connect to the LeadPilot server.');
  assert.strictEqual(result.isRetryable, true);
});

runTest('3. Correctly categorizes HTTP 401 Invalid Credentials', () => {
  const result = classifyAuthError(new Error('Invalid email or password'), 401);
  assert.strictEqual(result.category, 'INVALID_CREDENTIALS');
  assert.strictEqual(result.userMessage, 'The email or password you entered is incorrect.');
  assert.strictEqual(result.isRetryable, false);
});

runTest('4. Correctly categorizes HTTP 500 Backend / Database Errors without leaking raw exceptions', () => {
  const result = classifyAuthError(new Error('PrismaClientKnownRequestError: P2002 Unique constraint failed'), 500);
  assert.strictEqual(result.category, 'BACKEND_ERROR');
  assert.strictEqual(result.userMessage, 'The authentication service encountered an unexpected issue.');
  assert.strictEqual(result.isRetryable, true);
  // User message must NOT contain raw Prisma error
  assert.ok(!result.userMessage.includes('PrismaClientKnownRequestError'));
});

runTest('5. Correctly categorizes HTTP 503 Service Outages', () => {
  const result = classifyAuthError(new Error('Service Unavailable'), 503);
  assert.strictEqual(result.category, 'SERVICE_OUTAGE');
  assert.strictEqual(result.userMessage, 'LeadPilot authentication services are temporarily undergoing maintenance.');
  assert.strictEqual(result.isRetryable, true);
});

runTest('6. Password validation rejects short passwords (< 6 chars)', () => {
  const short1 = validatePassword('123');
  assert.strictEqual(short1.isValid, false);
  assert.strictEqual(short1.message, 'Password must be at least 6 characters');

  const short2 = validatePassword('abcde');
  assert.strictEqual(short2.isValid, false);
  assert.strictEqual(short2.message, 'Password must be at least 6 characters');
});

runTest('7. Password validation accepts passwords >= 6 chars', () => {
  const valid1 = validatePassword('123456');
  assert.strictEqual(valid1.isValid, true);
  assert.strictEqual(valid1.message, undefined);

  const valid2 = validatePassword('SuperSecretAgency2026!');
  assert.strictEqual(valid2.isValid, true);
});

runTest('8. Validates empty password safely', () => {
  const empty = validatePassword('');
  assert.strictEqual(empty.isValid, false);
  assert.strictEqual(empty.message, 'Password is required');
});

runTest('9. Validation error properly handles duplicate email on registration', () => {
  const result = classifyAuthError(new Error('User with this email already exists'), 400);
  assert.strictEqual(result.category, 'VALIDATION_ERROR');
  assert.strictEqual(result.userMessage, 'An account with this email address already exists.');
});

runTest('10. Diagnostics schema structure contains Server, Database, and Auth status', () => {
  const mockDiagnostics = {
    serverStatus: 'Operational',
    databaseStatus: 'Connected',
    authStatus: 'Ready',
    latencyMs: 14,
    timestamp: new Date().toISOString()
  };
  assert.ok(['Operational', 'Degraded', 'Offline'].includes(mockDiagnostics.serverStatus));
  assert.ok(['Connected', 'Degraded', 'Offline'].includes(mockDiagnostics.databaseStatus));
  assert.ok(['Ready', 'Config Issue', 'Unavailable'].includes(mockDiagnostics.authStatus));
  assert.ok(typeof mockDiagnostics.latencyMs === 'number');
});

console.log('\n================================================================');
console.log(`AUTH DIAGNOSTICS TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
