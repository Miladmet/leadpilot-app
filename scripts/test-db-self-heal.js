const assert = require('assert');
const { PrismaClient } = require('@prisma/client');
const { 
  SAFE_CORE_PROSPECT_SELECT, 
  POSTGRES_SELF_HEAL_STATEMENTS, 
  selfHealDatabaseSchema, 
  normalizeProspectDefaults 
} = require('../lib/dbSelfHealCore');

console.log('================================================================');
console.log('RUNNING DATABASE SELF-HEALING & DRIFT RECOVERY TESTS');
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
    // 1. PostgreSQL Alter Statements Format
    await runTest('1. Verified all self-healing SQL statements use ADD COLUMN IF NOT EXISTS', () => {
      assert.ok(POSTGRES_SELF_HEAL_STATEMENTS.length >= 10);
      for (const sql of POSTGRES_SELF_HEAL_STATEMENTS) {
        assert.ok(sql.includes('ADD COLUMN IF NOT EXISTS'), `Must be idempotent: ${sql}`);
        assert.ok(sql.includes('"Prospect"') || sql.includes('"User"'), `Must target Prospect or User table: ${sql}`);
      }
    });

    // 2. Verified core selection does not select unmigrated columns directly
    await runTest('2. SAFE_CORE_PROSPECT_SELECT excludes unmigrated columns for safe fallback', () => {
      assert.strictEqual(SAFE_CORE_PROSPECT_SELECT.id, true);
      assert.strictEqual(SAFE_CORE_PROSPECT_SELECT.companyName, true);
      assert.strictEqual(SAFE_CORE_PROSPECT_SELECT.analysisVersion, undefined);
      assert.strictEqual(SAFE_CORE_PROSPECT_SELECT.changeSummary, undefined);
      assert.strictEqual(SAFE_CORE_PROSPECT_SELECT.previousAnalysisId, undefined);
    });

    // 3. Normalizer fills missing fields with defaults
    await runTest('3. normalizeProspectDefaults fills missing schema fields safely', () => {
      const partialRecord = {
        id: 'p-1',
        companyName: 'Acme Dental',
        opportunityScore: 85
      };

      const normalized = normalizeProspectDefaults(partialRecord);
      assert.strictEqual(normalized.analysisVersion, 1);
      assert.strictEqual(normalized.previousAnalysisId, null);
      assert.strictEqual(normalized.changeSummary, '{}');
      assert.strictEqual(normalized.pagesDiscoveredCount, 1);
      assert.strictEqual(normalized.pagesCrawledCount, 1);
      assert.strictEqual(normalized.crawlCoveragePercent, 100);
      assert.strictEqual(normalized.crawlDurationMs, 0);
      assert.strictEqual(normalized.totalTextExtracted, 0);
    });

    // 4. selfHealDatabaseSchema execution safety (non-Postgres skips gracefully)
    await runTest('4. selfHealDatabaseSchema safely handles non-Postgres environments', async () => {
      const res = await selfHealDatabaseSchema(prisma);
      assert.ok(res.skipped || res.success);
    });

  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`DATABASE SELF-HEAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
