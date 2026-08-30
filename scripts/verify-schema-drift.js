const { PrismaClient } = require('@prisma/client');
const { verifyDatabaseSchema } = require('../lib/schemaVerificationCore');

async function runGate() {
  console.log('================================================================');
  console.log('DATABASE SCHEMA VERIFICATION GATE: DRIFT & DRIFT DETECTION');
  console.log('================================================================\n');

  const prisma = new PrismaClient();

  try {
    const result = await verifyDatabaseSchema(prisma);

    // Print the standardized report
    console.log(result.reportText);
    console.log('\n================================================================');
    console.log(`MODELS VERIFIED: ${result.totalModelsChecked} | SCHEMA STATUS: ${result.schemaStatus.toUpperCase()} | MIGRATION STATUS: ${result.migrationStatus.toUpperCase()}`);
    console.log('================================================================\n');

    if (!result.isHealthy) {
      console.error('❌ DEPLOYMENT BLOCKED: Database schema drift detected!');
      console.error(`Total missing items: ${result.missingItemsCount}`);
      for (const item of result.missingItems) {
        console.error(`  - ${item.model} (${item.type}): ${item.name}`);
      }
      console.error('\nPlease run `npx prisma db push` or apply pending migrations before deploying.\n');
      process.exit(1);
    }

    console.log('✅ SCHEMA VERIFICATION PASSED: All Prisma models and columns match live database.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR EXECUTING SCHEMA VERIFICATION GATE:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runGate();
