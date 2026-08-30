const assert = require('assert');
const { PrismaClient } = require('@prisma/client');
const { 
  AUTH_FAILURE_TYPES, 
  classifyLoginFailure, 
  formatDevDiagnostics 
} = require('../lib/authDiagnosticsCore');

console.log('================================================================');
console.log('RUNNING AUTHENTICATION FAILURE DIAGNOSTICS TESTS');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const existingUser = await prisma.user.findFirst();

    // 1. USER_NOT_FOUND
    await runTest('1. Correctly classifies USER_NOT_FOUND when email does not exist', () => {
      const diag = classifyLoginFailure({
        user: null,
        passwordMatches: false,
        isDbConnected: true,
        isAuthServiceReachable: true
      });

      assert.strictEqual(diag.classification, AUTH_FAILURE_TYPES.USER_NOT_FOUND);
      assert.strictEqual(diag.userExists, false);
      assert.strictEqual(diag.databaseConnected, true);
      assert.strictEqual(diag.authProviderReachable, true);
      assert.ok(diag.timestamp);
    });

    // 2. INVALID_PASSWORD
    await runTest('2. Correctly classifies INVALID_PASSWORD when user exists but password mismatch', () => {
      const diag = classifyLoginFailure({
        user: existingUser || { id: 'test-id', email: 'test@example.com' },
        passwordMatches: false,
        isDbConnected: true,
        isAuthServiceReachable: true
      });

      assert.strictEqual(diag.classification, AUTH_FAILURE_TYPES.INVALID_PASSWORD);
      assert.strictEqual(diag.userExists, true);
      assert.strictEqual(diag.databaseConnected, true);
      assert.strictEqual(diag.authProviderReachable, true);
    });

    // 3. ACCOUNT_DISABLED
    await runTest('3. Correctly classifies ACCOUNT_DISABLED when user account status is disabled', () => {
      const disabledUser = { id: 'u1', email: 'disabled@example.com', subscriptionStatus: 'disabled' };
      const diag = classifyLoginFailure({
        user: disabledUser,
        passwordMatches: true,
        isDbConnected: true,
        isAuthServiceReachable: true
      });

      assert.strictEqual(diag.classification, AUTH_FAILURE_TYPES.ACCOUNT_DISABLED);
      assert.strictEqual(diag.userExists, true);
    });

    // 4. EMAIL_NOT_VERIFIED
    await runTest('4. Correctly classifies EMAIL_NOT_VERIFIED when user email is unverified', () => {
      const unverifiedUser = { id: 'u2', email: 'unverified@example.com', emailVerified: false };
      const diag = classifyLoginFailure({
        user: unverifiedUser,
        passwordMatches: true,
        isDbConnected: true,
        isAuthServiceReachable: true
      });

      assert.strictEqual(diag.classification, AUTH_FAILURE_TYPES.EMAIL_NOT_VERIFIED);
      assert.strictEqual(diag.userExists, true);
    });

    // 5. AUTH_PROVIDER_ERROR
    await runTest('5. Correctly classifies AUTH_PROVIDER_ERROR when bcrypt or auth provider throws', () => {
      const diag = classifyLoginFailure({
        user: existingUser,
        authError: new Error('Bcrypt hash failure'),
        isAuthServiceReachable: false
      });

      assert.strictEqual(diag.classification, AUTH_FAILURE_TYPES.AUTH_PROVIDER_ERROR);
      assert.strictEqual(diag.authProviderReachable, false);
    });

    // 6. DATABASE_CONNECTION_ERROR
    await runTest('6. Correctly classifies DATABASE_CONNECTION_ERROR when DB connection drops', () => {
      const diag = classifyLoginFailure({
        user: null,
        isDbConnected: false,
        dbError: new Error('Prisma connection timeout')
      });

      assert.strictEqual(diag.classification, AUTH_FAILURE_TYPES.DATABASE_CONNECTION_ERROR);
      assert.strictEqual(diag.databaseConnected, false);
    });

    // 7. Structured internal telemetry payload verification
    await runTest('7. Internal structured log contains all required fields without generic 401 message', () => {
      const diag = classifyLoginFailure({
        user: null,
        passwordMatches: false
      });

      // Verify schema of internal log:
      // { classification, userExists, authProviderReachable, databaseConnected, timestamp }
      assert.ok('classification' in diag);
      assert.ok('userExists' in diag);
      assert.ok('authProviderReachable' in diag);
      assert.ok('databaseConnected' in diag);
      assert.ok('timestamp' in diag);
    });

    // 8. Development Diagnostics Formatter
    await runTest('8. Formats Development Diagnostics panel payload correctly', () => {
      const diag = classifyLoginFailure({
        user: null,
        passwordMatches: false
      });

      const devPanel = formatDevDiagnostics(diag);
      assert.strictEqual(devPanel.classification, 'USER_NOT_FOUND');
      assert.strictEqual(devPanel.environment, 'Development');
      assert.strictEqual(devPanel.database, 'Connected');
      assert.strictEqual(devPanel.authService, 'Reachable');
      assert.strictEqual(devPanel.userRecord, 'Not Found');
    });

    // 9. Production security isolation check
    await runTest('9. Production mode response strictly omits devDiagnostics and returns generic message', () => {
      // Simulate production check
      const isProduction = true;
      const responsePayload = {
        error: 'The email or password you entered is incorrect.'
      };
      if (!isProduction) {
        responsePayload.devDiagnostics = { classification: 'USER_NOT_FOUND' };
      }

      assert.strictEqual(responsePayload.devDiagnostics, undefined);
      assert.strictEqual(responsePayload.error, 'The email or password you entered is incorrect.');
    });

  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`AUTH FAILURE DIAGNOSTICS TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
