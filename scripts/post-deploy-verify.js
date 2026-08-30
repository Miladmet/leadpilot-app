const { PrismaClient } = require('@prisma/client');
const { verifyDatabaseSchema } = require('../lib/schemaVerificationCore');

async function runPostDeployVerification() {
  console.log('================================================================');
  console.log('POST-DEPLOYMENT AUTOMATED DATABASE VERIFICATION');
  console.log('================================================================\n');

  const prisma = new PrismaClient();

  try {
    // 1. Run live schema verification
    const result = await verifyDatabaseSchema(prisma);

    if (!result.isHealthy) {
      console.error('❌ POST-DEPLOYMENT VERIFICATION FAILED: Database drift detected in target environment!');
      if (result.driftBlockedText) {
        console.error(result.driftBlockedText);
      }
      process.exit(1);
    }

    // 2. Validate live read queries on core tables
    console.log('[Post-Deploy] Testing live queries on core tables...');
    await prisma.user.findFirst({ select: { id: true, email: true } });
    await prisma.prospect.findFirst({ select: { id: true, analysisVersion: true, opportunityRange: true } });
    await prisma.researchReports.findFirst({ select: { id: true, url: true } });
    await prisma.opportunityAnalysis.findFirst({ select: { id: true, opportunityScore: true } });

    console.log('\n================================================================');
    console.log('POST-DEPLOYMENT AUDIT SUMMARY:');
    console.log(`- Schema Status: ${result.schemaStatus}`);
    console.log(`- Migration Status: ${result.migrationStatus}`);
    console.log(`- Missing Tables: ${result.missingTablesCount}`);
    console.log(`- Missing Columns: ${result.missingColumnsCount}`);
    console.log(`- Verification Timestamp: ${result.lastVerification}`);
    console.log('================================================================');
    console.log('✅ POST-DEPLOYMENT VERIFICATION PASSED: Production database is in 100% lockstep with Prisma schema.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ POST-DEPLOYMENT AUDIT FAILED WITH ERROR:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPostDeployVerification();
