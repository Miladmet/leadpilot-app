const { PrismaClient } = require('@prisma/client');
const { runDeploymentVerification } = require('../lib/deploymentVerificationCore');

async function runPostDeployVerification() {
  console.log('================================================================');
  console.log('POST-DEPLOYMENT AUTOMATED DEPLOYMENT VERIFICATION ENGINE');
  console.log('================================================================\n');

  const prisma = new PrismaClient();

  try {
    const result = await runDeploymentVerification(prisma);

    console.log(`Schema Health Score: ${result.schemaHealth.score}/100 (${result.schemaHealth.rating})`);
    console.log(`Schema Status:       ${result.schemaHealth.status}`);
    console.log(`Migration Status:    ${result.schemaHealth.migrationStatus}`);
    console.log(`Missing Tables:      ${result.schemaHealth.missingTablesCount}`);
    console.log(`Missing Columns:     ${result.schemaHealth.missingColumnsCount}`);
    console.log(`Last Verification:   ${result.schemaHealth.lastVerification}\n`);

    console.log('POST-DEPLOY ROUTE HEALTH CHECKS:');
    const { checks } = result.routesHealth;
    console.log(`  ${checks.prospectsRoute.status === 'HEALTHY' ? '✅' : '❌'} ${checks.prospectsRoute.route} (${checks.prospectsRoute.latencyMs}ms)`);
    console.log(`  ${checks.dashboardStatsRoute.status === 'HEALTHY' ? '✅' : '❌'} ${checks.dashboardStatsRoute.route} (${checks.dashboardStatsRoute.latencyMs}ms)`);
    console.log(`  ${checks.analyzeRoute.status === 'HEALTHY' ? '✅' : '❌'} ${checks.analyzeRoute.route} (${checks.analyzeRoute.latencyMs}ms)\n`);

    console.log('PLATFORM STATUS:');
    console.log(`  Trust:      ${result.platformStatus.subsystems.trust.status}`);
    console.log(`  Security:   ${result.platformStatus.subsystems.security.status}`);
    console.log(`  Storage:    ${result.platformStatus.subsystems.storage.status}`);
    console.log(`  Schema:     ${result.platformStatus.subsystems.schema.status}`);
    console.log(`  Deployment: ${result.platformStatus.subsystems.deployment.status}\n`);

    if (result.alerts.length > 0) {
      console.log('INFRASTRUCTURE ALERTS:');
      for (const alert of result.alerts) {
        console.error(`  [${alert.severity}] ${alert.message}`);
      }
      console.log('');
    }

    if (!result.isDeploymentApproved) {
      console.error('❌ POST-DEPLOYMENT VERIFICATION FAILED: Database drift or route health failure detected!');
      process.exit(1);
    }

    console.log('================================================================');
    console.log('✅ POST-DEPLOYMENT VERIFICATION PASSED: Production is verified and healthy.');
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ POST-DEPLOYMENT AUDIT FAILED WITH ERROR:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPostDeployVerification();
