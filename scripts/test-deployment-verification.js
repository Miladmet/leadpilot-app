const assert = require('assert');
const { PrismaClient } = require('@prisma/client');
const {
  calculateSchemaHealthScore,
  generateSchemaAlerts,
  getPlatformStatus,
  verifyCoreRoutesHealth,
  runDeploymentVerification
} = require('../lib/deploymentVerificationCore');

console.log('================================================================');
console.log('RUNNING DEPLOYMENT VERIFICATION ENGINE TESTS');
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
    // 1. Score Calculation - Perfect Schema
    await runTest('1. Schema Health Score returns 100 with EXCELLENT rating for clean schema', () => {
      const clean = {
        missingTablesCount: 0,
        missingColumnsCount: 0,
        migrationStatus: 'Up To Date'
      };
      const result = calculateSchemaHealthScore(clean);
      assert.strictEqual(result.score, 100);
      assert.strictEqual(result.rating, 'EXCELLENT');
    });

    // 2. Score Calculation - Penalties for Missing Columns
    await runTest('2. Schema Health Score correctly applies penalty for missing columns', () => {
      const drifted = {
        missingTablesCount: 0,
        missingColumnsCount: 2,
        migrationStatus: 'Up To Date'
      };
      const result = calculateSchemaHealthScore(drifted);
      assert.strictEqual(result.score, 80);
      assert.strictEqual(result.rating, 'DEGRADED');
      assert.strictEqual(result.breakdown.missingColumnsPenalty, 20);
    });

    // 3. Score Calculation - Penalties for Missing Tables & Unapplied Migrations
    await runTest('3. Schema Health Score drops to CRITICAL when table missing and migrations pending', () => {
      const critical = {
        missingTablesCount: 1,
        missingColumnsCount: 1,
        migrationStatus: 'Pending Migration'
      };
      const result = calculateSchemaHealthScore(critical);
      // 100 - 30 (table) - 10 (col) - 20 (migration) = 40
      assert.strictEqual(result.score, 40);
      assert.strictEqual(result.rating, 'CRITICAL');
    });

    // 4. Alert Generation for Missing Items
    await runTest('4. Generates structured alerts for missing columns, tables, and unapplied migrations', () => {
      const driftReport = {
        missingTables: ['Prospect'],
        missingColumns: [{ model: 'Prospect', name: 'analysisVersion' }],
        migrationStatus: 'Pending Migration'
      };
      const alerts = generateSchemaAlerts(driftReport);
      assert.strictEqual(alerts.length, 3);
      assert.strictEqual(alerts[0].type, 'TABLE_MISSING');
      assert.strictEqual(alerts[1].type, 'COLUMN_MISSING');
      assert.strictEqual(alerts[2].type, 'MIGRATION_UNAPPLIED');
      assert.ok(alerts[1].message.includes('analysisVersion'));
    });

    // 5. Platform Status Aggregation
    await runTest('5. Platform Status reports all 5 healthy subsystems when no drift exists', () => {
      const status = getPlatformStatus({
        trustPassed: true,
        securityPassed: true,
        storagePassed: true,
        schemaScore: 100,
        routesPassed: true
      });
      assert.strictEqual(status.overall, 'Healthy');
      assert.strictEqual(status.subsystems.trust.status, 'Healthy');
      assert.strictEqual(status.subsystems.security.status, 'Healthy');
      assert.strictEqual(status.subsystems.storage.status, 'Healthy');
      assert.strictEqual(status.subsystems.schema.status, 'Healthy');
      assert.strictEqual(status.subsystems.deployment.status, 'Healthy');
    });

    // 6. Platform Status Degradation
    await runTest('6. Platform Status degrades when schema drift or route health fails', () => {
      const degraded = getPlatformStatus({
        trustPassed: true,
        securityPassed: true,
        storagePassed: true,
        schemaScore: 75,
        routesPassed: false
      });
      assert.strictEqual(degraded.overall, 'Degraded');
      assert.strictEqual(degraded.subsystems.schema.status, 'Degraded');
      assert.strictEqual(degraded.subsystems.deployment.status, 'Degraded');
    });

    // 7. Core Routes Live Health Verification
    await runTest('7. verifyCoreRoutesHealth tests /api/prospects, /api/dashboard/stats, /api/analyze', async () => {
      const routesHealth = await verifyCoreRoutesHealth(prisma);
      assert.strictEqual(routesHealth.allPassed, true);
      assert.strictEqual(routesHealth.checks.prospectsRoute.status, 'HEALTHY');
      assert.strictEqual(routesHealth.checks.dashboardStatsRoute.status, 'HEALTHY');
      assert.strictEqual(routesHealth.checks.analyzeRoute.status, 'HEALTHY');
    });

    // 8. Full Deployment Verification Pipeline
    await runTest('8. runDeploymentVerification approves deployment on live database', async () => {
      const deploymentResult = await runDeploymentVerification(prisma);
      assert.strictEqual(deploymentResult.isDeploymentApproved, true);
      assert.strictEqual(deploymentResult.schemaHealth.score, 100);
      assert.strictEqual(deploymentResult.platformStatus.overall, 'Healthy');
    });

  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`DEPLOYMENT VERIFICATION TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
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
