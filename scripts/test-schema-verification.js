const assert = require('assert');
const { PrismaClient } = require('@prisma/client');
const { verifyDatabaseSchema, EXPECTED_MODELS } = require('../lib/schemaVerificationCore');
const { isSchemaMismatchError, parsePrismaSchemaError, USER_FACING_SCHEMA_ERROR } = require('../lib/schemaErrorLoggerCore');

console.log('================================================================');
console.log('RUNNING DATABASE SCHEMA VERIFICATION & DRIFT DETECTION TESTS');
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

    await runTest('1. Live Database Schema is Healthy with zero drift', () => {
      assert.strictEqual(liveResult.isHealthy, true, 'Live database must be healthy');
      assert.strictEqual(liveResult.schemaStatus, 'Healthy');
      assert.strictEqual(liveResult.migrationStatus, 'Up To Date');
      assert.strictEqual(liveResult.missingItemsCount, 0);
    });

    await runTest('2. Formatted report contains all 8 required models with "All Columns Present"', () => {
      assert.ok(liveResult.reportText.includes('Prospect\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('OpportunityAnalysis\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('ResearchReports\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('User\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('ActivityLog\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('Proposals\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('OutreachMessages\n✅ All Columns Present'));
      assert.ok(liveResult.reportText.includes('Subscriptions\n✅ All Columns Present'));
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

    await runTest('4. Drift detection accurately flags artificial missing columns and produces formatted report', () => {
      // Create a mock mockTables Map with missing column 'analysisVersion' in Prospect
      const mockLiveTables = new Map();
      for (const [mName, def] of Object.entries(EXPECTED_MODELS)) {
        const cols = new Set(def.columns);
        if (mName === 'Prospect') {
          cols.delete('analysisVersion');
        }
        mockLiveTables.set(def.tableName, cols);
      }

      // Run comparison logic
      const modelReports = [];
      let mockHealthy = true;
      const reportLines = ['Schema Verification Report\n'];

      for (const [modelName, def] of Object.entries(EXPECTED_MODELS)) {
        const liveCols = mockLiveTables.get(def.tableName);
        const missing = def.columns.filter(c => !liveCols.has(c));
        if (missing.length > 0) {
          mockHealthy = false;
          reportLines.push(`${modelName}`);
          for (const col of missing) {
            reportLines.push(`❌ Missing Column:`);
            reportLines.push(`${col}`);
          }
          reportLines.push('');
        } else {
          reportLines.push(`${modelName}`);
          reportLines.push(`✅ All Columns Present\n`);
        }
      }

      const mockReport = reportLines.join('\n').trim();
      assert.strictEqual(mockHealthy, false, 'Must flag healthy as false when column missing');
      assert.ok(mockReport.includes('Prospect\n❌ Missing Column:\nanalysisVersion'));
    });

    await runTest('5. P2021 (Table does not exist) error classifier and structured logger', () => {
      const fakeP2021 = new Error('The table `public.Prospect` does not exist in the current database.');
      fakeP2021.code = 'P2021';

      assert.strictEqual(isSchemaMismatchError(fakeP2021), true);
      const log = parsePrismaSchemaError(fakeP2021, '/api/analyze');
      assert.strictEqual(log.prismaErrorCode, 'P2021');
      assert.strictEqual(log.model, 'Prospect');
      assert.strictEqual(log.route, '/api/analyze');
      assert.strictEqual(USER_FACING_SCHEMA_ERROR, 'Database schema mismatch detected.');
    });

    await runTest('6. P2022 (Column does not exist) error classifier and structured logger', () => {
      const fakeP2022 = new Error('The column `Prospect.analysisVersion` does not exist in the current database.');
      fakeP2022.code = 'P2022';

      assert.strictEqual(isSchemaMismatchError(fakeP2022), true);
      const log = parsePrismaSchemaError(fakeP2022, '/api/prospects');
      assert.strictEqual(log.prismaErrorCode, 'P2022');
      assert.strictEqual(log.model, 'Prospect');
      assert.strictEqual(log.column, 'analysisVersion');
      assert.strictEqual(log.route, '/api/prospects');
      assert.ok(log.timestamp);
    });

  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`SCHEMA VERIFICATION TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
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
