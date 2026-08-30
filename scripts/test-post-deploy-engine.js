const assert = require('assert');
const { PrismaClient } = require('@prisma/client');
const {
  CRITICAL_MODELS,
  validateDatabaseSchema,
  validatePrismaQueries,
  validateApiEndpoints,
  validateAuthentication,
  validateTrustEngine,
  validateRlsSecurity,
  validateStorageSecurity,
  generateDeploymentHealthReport,
  runAutomaticPostDeployValidation,
  getDeploymentHistory
} = require('../lib/postDeployValidationCore');

console.log('================================================================');
console.log('TESTING AUTOMATIC POST-DEPLOY VALIDATION ENGINE');
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
    // 1. Critical Models Verification
    await runTest('1. Critical Models list contains all 6 required models', () => {
      assert.strictEqual(CRITICAL_MODELS.length, 6);
      assert.ok(CRITICAL_MODELS.includes('Prospect'));
      assert.ok(CRITICAL_MODELS.includes('User'));
      assert.ok(CRITICAL_MODELS.includes('ActivityLog'));
      assert.ok(CRITICAL_MODELS.includes('OpportunityAnalysis'));
      assert.ok(CRITICAL_MODELS.includes('ResearchReports'));
      assert.ok(CRITICAL_MODELS.includes('Proposals'));
    });

    // 2. Area 1: Database Schema Validation
    await runTest('2. validateDatabaseSchema passes on current database with 0 missing columns', async () => {
      const schema = await validateDatabaseSchema(prisma);
      assert.strictEqual(schema.passed, true);
      assert.strictEqual(schema.status, 'Healthy');
      assert.strictEqual(schema.missingColumnsCount, 0);
      assert.strictEqual(schema.missingTablesCount, 0);
    });

    // 3. Area 2: Prisma Queries on 6 Critical Models
    await runTest('3. validatePrismaQueries tests sample queries on all 6 critical models', async () => {
      const queries = await validatePrismaQueries(prisma);
      assert.strictEqual(queries.passed, true);
      assert.strictEqual(queries.status, 'Healthy');
      assert.strictEqual(queries.verifiedCriticalModelsCount, 6);
    });

    // 4. Area 3: API Endpoints Validation
    await runTest('4. validateApiEndpoints tests /api/auth/me, /api/prospects, /api/dashboard/stats, /api/analyze', async () => {
      const api = await validateApiEndpoints(prisma);
      assert.strictEqual(api.passed, true);
      assert.strictEqual(api.status, 'Healthy');
      assert.strictEqual(api.verifiedEndpointsCount, 4);
    });

    // 5. Area 4: Authentication Security
    await runTest('5. validateAuthentication confirms cryptographic JWT & Bcrypt operations', () => {
      const auth = validateAuthentication();
      assert.strictEqual(auth.passed, true);
      assert.strictEqual(auth.status, 'Healthy');
    });

    // 6. Area 5: Trust Engine Validation
    await runTest('6. validateTrustEngine verifies all 6 trust controls and high score', () => {
      const trust = validateTrustEngine();
      assert.strictEqual(trust.passed, true);
      assert.strictEqual(trust.status, 'Healthy');
      assert.ok(trust.trustScore >= 95);
    });

    // 7. Area 6 & 7: RLS and Storage Security
    await runTest('7. validateRlsSecurity and validateStorageSecurity pass with full policy coverage', async () => {
      const rls = await validateRlsSecurity(prisma);
      const storage = validateStorageSecurity();
      assert.strictEqual(rls.passed, true);
      assert.strictEqual(storage.passed, true);
      assert.strictEqual(storage.totalBuckets, 9);
      assert.strictEqual(storage.protectedBuckets, 6);
    });

    // 8. Full Validation Engine Run and History Ledger
    await runTest('8. runAutomaticPostDeployValidation produces HEALTHY overall status and records history', async () => {
      const result = await runAutomaticPostDeployValidation(prisma, { commitId: 'test-commit-sha' });
      assert.strictEqual(result.overallHealth, 'HEALTHY');
      assert.strictEqual(result.schemaStatus, 'Healthy');
      assert.strictEqual(result.apiStatus, 'Healthy');
      assert.strictEqual(result.securityStatus, 'Healthy');
      assert.strictEqual(result.trustStatus, 'Healthy');
      assert.strictEqual(result.storageStatus, 'Healthy');
      assert.ok(result.report.includes('LEADPILOT PRODUCTION DEPLOYMENT HEALTH REPORT'));

      const history = getDeploymentHistory();
      assert.ok(history.length > 0);
      assert.strictEqual(history[0].overallHealth, 'HEALTHY');
    });

  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`POST-DEPLOY VALIDATION TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
