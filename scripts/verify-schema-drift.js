const { PrismaClient } = require('@prisma/client');
const { verifyDatabaseSchema } = require('../lib/schemaVerificationCore');
const { calculateSchemaHealthScore, generateSchemaAlerts } = require('../lib/deploymentVerificationCore');

async function runGate() {
  const prisma = new PrismaClient();

  try {
    const result = await verifyDatabaseSchema(prisma);
    const healthScore = calculateSchemaHealthScore(result);
    const alerts = generateSchemaAlerts(result);

    // 1. Output the Database Schema Health Report
    console.log('================================================================');
    console.log(result.reportText);
    console.log('================================================================\n');

    console.log(`Schema Health Score: ${healthScore.score}/100 (${healthScore.rating})`);
    console.log(`Migration Status:    ${result.migrationStatus}`);
    console.log(`Missing Tables:      ${result.missingTablesCount}`);
    console.log(`Missing Columns:     ${result.missingColumnsCount}`);

    if (alerts.length > 0) {
      console.log('\n[Schema Alerts Detected]:');
      for (const alert of alerts) {
        console.error(`  [${alert.severity}] ${alert.message}`);
      }
    }

    if (!result.isHealthy || healthScore.score < 100) {
      console.log('\n[Schema Drift Gate] Schema drift detected! Attempting automatic self-healing...');
      const { selfHealDatabaseSchema } = require('../lib/dbSelfHealCore');
      const healResult = await selfHealDatabaseSchema(prisma);
      console.log(`[Schema Drift Gate] Self-healing executed ${healResult.executedCount || 0} DDL statements.`);

      // Re-verify after healing
      const recheck = await verifyDatabaseSchema(prisma);
      const recheckScore = calculateSchemaHealthScore(recheck);

      if (recheck.isHealthy && recheckScore.score === 100) {
        console.log('\n================================================================');
        console.log('✅ [Schema Drift Gate] SCHEMA DRIFT AUTOMATICALLY RESOLVED VIA SELF-HEALING!');
        console.log('Schema Health Score: 100/100 (EXCELLENT)');
        console.log('Database Health Status: HEALTHY');
        console.log('================================================================\n');
        process.exit(0);
      }

      // If still not healthy, block deployment safely
      console.error('\n' + (recheck.driftBlockedText || 'Schema Drift Detected\n\nStatus:\nDeployment Blocked'));
      console.error('\nTotal drift items remaining:', recheck.missingItemsCount);
      for (const item of recheck.missingItems) {
        console.error(`- ${item.model} (${item.type}): ${item.name}`);
      }
      process.exit(1);
    }

    console.log('\nDatabase Health Status: HEALTHY');
    console.log(`Verified Models: ${result.totalModelsChecked} | Missing Columns: 0 | Missing Tables: 0`);
    console.log('✅ SCHEMA VERIFICATION PASSED: No schema drift detected.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ CRITICAL ERROR IN SCHEMA DRIFT DETECTION:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runGate();
