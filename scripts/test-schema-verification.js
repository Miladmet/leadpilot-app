const assert = require('assert');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const { verifyDatabaseSchema, formatDriftBlockedReport, EXPECTED_MODELS } = require('../lib/schemaVerificationCore');
const { isSchemaMismatchError, parsePrismaSchemaError, USER_FACING_SCHEMA_ERROR, DEPLOYMENT_VERSION } = require('../lib/schemaErrorLoggerCore');

console.log('================================================================');
console.log('RUNNING DATABASE SCHEMA DRIFT & DEPLOYMENT PROTECTION TESTS');
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
    // 1. Run live schema verification
    const liveResult = await verifyDatabaseSchema(prisma);

    await runTest('1. Live Database Schema is Healthy with zero missing tables or columns', () => {
      assert.strictEqual(liveResult.isHealthy, true, 'Live database must be healthy');
      assert.strictEqual(liveResult.schemaStatus, 'Healthy');
      assert.strictEqual(liveResult.migrationStatus, 'Up To Date');
      assert.strictEqual(liveResult.missingTablesCount, 0);
      assert.strictEqual(liveResult.missingColumnsCount, 0);
    });

    await runTest('2. Formatted report header is "Database Schema Health Report"', () => {
      assert.ok(liveResult.reportText.startsWith('Database Schema Health Report'));
      assert.ok(liveResult.reportText.includes('Prospect\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('OpportunityAnalysis\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('ResearchReports\n✅ All Columns Present'));
    });

    await runTest('3. Prospect table contains critical columns (analysisVersion, opportunityRange, changeSummary)', () => {
      const prospectModel = liveResult.models.find(m => m.modelName === 'Prospect');
      assert.ok(prospectModel, 'Prospect model must exist');
      assert.strictEqual(prospectModel.status, 'HEALTHY');
      assert.ok(prospectModel.existingColumns.includes('analysisVersion'));
      assert.ok(prospectModel.existingColumns.includes('opportunityRange'));
      assert.ok(prospectModel.existingColumns.includes('revenueAssumptions'));
      assert.ok(prospectModel.existingColumns.includes('changeSummary'));
      assert.ok(prospectModel.existingColumns.includes('evidenceQuality'));
    });

    await runTest('4. Drift detection outputs exact required "Deployment Blocked" report', () => {
      const simulatedDrift = {
        model: 'Prospect',
        type: 'COLUMN',
        name: 'analysisVersion'
      };

      const blockedOutput = formatDriftBlockedReport(simulatedDrift);
      const expectedLines = [
        'Schema Drift Detected',
        '',
        'Model:',
        'Prospect',
        '',
        'Missing Column:',
        'analysisVersion',
        '',
        'Status:',
        'Deployment Blocked'
      ].join('\n');

      assert.strictEqual(blockedOutput, expectedLines);
    });

    await runTest('5. P2021 (Table does not exist) displays administrator message and structured log', () => {
      const fakeP2021 = new Error('The table `public.Prospect` does not exist in the current database.');
      fakeP2021.code = 'P2021';

      assert.strictEqual(isSchemaMismatchError(fakeP2021), true);
      const log = parsePrismaSchemaError(fakeP2021, '/api/analyze');
      assert.strictEqual(log.prismaErrorCode, 'P2021');
      assert.strictEqual(log.model, 'Prospect');
      assert.strictEqual(log.affectedRoute, '/api/analyze');
      assert.ok(log.deploymentVersion, 'Must contain deployment version');
      assert.strictEqual(USER_FACING_SCHEMA_ERROR, 'Database schema mismatch detected. Administrator attention required.');
    });

    await runTest('6. P2022 (Column does not exist) logs Model, Column, Route, and Deployment Version', () => {
      const fakeP2022 = new Error('The column `Prospect.analysisVersion` does not exist in the current database.');
      fakeP2022.code = 'P2022';

      assert.strictEqual(isSchemaMismatchError(fakeP2022), true);
      const log = parsePrismaSchemaError(fakeP2022, '/api/prospects');
      assert.strictEqual(log.prismaErrorCode, 'P2022');
      assert.strictEqual(log.model, 'Prospect');
      assert.strictEqual(log.column, 'analysisVersion');
      assert.strictEqual(log.affectedRoute, '/api/prospects');
      assert.strictEqual(log.deploymentVersion, DEPLOYMENT_VERSION);
    });

    await runTest('7. Automated post-deployment verification script executes cleanly', () => {
      const output = execSync('node scripts/post-deploy-verify.js', { encoding: 'utf8' });
      assert.ok(output.includes('POST-DEPLOYMENT VERIFICATION PASSED'));
      assert.ok(output.includes('Schema Status: Healthy'));
    });

  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`SCHEMA DRIFT TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
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
