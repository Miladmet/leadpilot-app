const { PrismaClient } = require('@prisma/client');
const { runAutomaticPostDeployValidation } = require('../lib/postDeployValidationCore');

async function runPostDeployVerification() {
  const prisma = new PrismaClient();

  try {
    const result = await runAutomaticPostDeployValidation(prisma);

    console.log(result.report);

    if (result.overallHealth !== 'HEALTHY') {
      console.error('\nâŒ POST-DEPLOYMENT VERIFICATION FAILED: Critical schema, query, or security checks did not pass.');
      process.exit(1);
    }

    console.log('\nâœ… POST-DEPLOYMENT VERIFICATION PASSED: Production is 100% verified and healthy.\n');
    process.exit(0);
  } catch (err) {
    console.error('âŒ POST-DEPLOYMENT AUDIT FAILED WITH UNHANDLED ERROR:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPostDeployVerification();
