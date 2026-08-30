const { PrismaClient } = require('@prisma/client');
const { verifyDatabaseSchema } = require('../lib/schemaVerificationCore');

async function runGate() {
  const prisma = new PrismaClient();

  try {
    const result = await verifyDatabaseSchema(prisma);

    // 1. Output the Database Schema Health Report
    console.log('================================================================');
    console.log(result.reportText);
    console.log('================================================================\n');

    if (!result.isHealthy) {
      // 2. Output the exact required drift failure block
      console.error(result.driftBlockedText || 'Schema Drift Detected\n\nStatus:\nDeployment Blocked');
      console.error('\nTotal drift items:', result.missingItemsCount);
      for (const item of result.missingItems) {
        console.error(`- ${item.model} (${item.type}): ${item.name}`);
      }
      process.exit(1);
    }

    console.log('Database Health Status: HEALTHY');
    console.log('Migration Status: UP TO DATE');
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
