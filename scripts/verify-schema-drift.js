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
      // 2. Output the exact required drift failure block
      console.error('\n' + (result.driftBlockedText || 'Schema Drift Detected\n\nStatus:\nDeployment Blocked'));
      console.error('\nTotal drift items:', result.missingItemsCount);
      for (const item of result.missingItems) {
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
