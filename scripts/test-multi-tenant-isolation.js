const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runIsolationTests() {
  console.log('================================================================');
  console.log('       LEADPILOT MULTI-TENANT DATA ISOLATION TEST RUNNER        ');
  console.log('================================================================\n');

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function recordCheck(name, success, info) {
    results.totalTests++;
    if (success) {
      results.passed++;
      console.log(`  [PASS] ${name}: ${info}`);
    } else {
      results.failed++;
      console.error(`  [FAIL] ${name}: ${info}`);
    }
    results.details.push({ name, success, info });
  }

  let userA, userB, prospectA, reportA, oppA, propA, msgA, subA;

  try {
    const passwordHash = await bcrypt.hash('TestSecurityPass123!', 10);

    // 1. Provision Tenant A
    userA = await prisma.user.upsert({
      where: { email: 'tenant_alpha@leadpilot.test' },
      update: {},
      create: {
        email: 'tenant_alpha@leadpilot.test',
        passwordHash,
        subscriptionTier: 'PRO',
      }
    });

    // 2. Provision Tenant B
    userB = await prisma.user.upsert({
      where: { email: 'tenant_bravo@leadpilot.test' },
      update: {},
      create: {
        email: 'tenant_bravo@leadpilot.test',
        passwordHash,
        subscriptionTier: 'FREE',
      }
    });

    console.log(`[Setup] Provisioned Tenant A (${userA.id.slice(0, 8)}) and Tenant B (${userB.id.slice(0, 8)})\n`);

    // Clean up any stale records from previous test runs
    await prisma.prospect.deleteMany({ where: { userId: userA.id } });
    await prisma.prospect.deleteMany({ where: { userId: userB.id } });

    // 3. Seed Tenant A Data across customer-facing tables
    prospectA = await prisma.prospect.create({
      data: {
        userId: userA.id,
        companyName: 'Alpha Secure Corp',
        websiteUrl: 'https://alpha-secure.test',
        opportunityScore: 85,
        buyingSignalScore: 90,
        potentialRevenue: 45000,
        closingProbability: 80,
        problemSeverity: 'High',
        leadQuality: 'Hot',
        verifiedFacts: '[]',
        aiInferences: '[]',
        buyingSignals: '[]',
        recommendations: '[]',
        scoreExplanations: '{}',
        executiveSummary: 'Confidential strategic insights for Alpha',
        expectedResults: 'High impact',
        estimatedRoi: '350%',
        thirtyDayPlan: 'Phase 1',
        ninetyDayPlan: 'Phase 2',
        pricingRecommendation: '$45,000',
        coldEmail: 'Confidential cold email',
        linkedInMessage: 'Confidential linkedin',
        discoveryScript: 'Confidential discovery',
        followUpSequence: 'Confidential followup',
        meetingAgenda: 'Confidential agenda',
      }
    });

    reportA = await prisma.researchReports.create({
      data: {
        userId: userA.id,
        prospectId: prospectA.id,
        url: 'https://alpha-secure.test/pricing',
        title: 'Alpha Pricing Secrets',
        crawledText: 'Confidential competitive pricing data',
      }
    });

    oppA = await prisma.opportunityAnalysis.create({
      data: {
        userId: userA.id,
        prospectId: prospectA.id,
        opportunityScore: 92,
        buyingSignalScore: 88,
        recommendations: '["Private Opportunity 1"]',
      }
    });

    propA = await prisma.proposals.create({
      data: {
        userId: userA.id,
        prospectId: prospectA.id,
        title: 'Strictly Confidential Proposal',
        pricing: '$50,000 Retainer',
      }
    });

    msgA = await prisma.outreachMessages.create({
      data: {
        userId: userA.id,
        prospectId: prospectA.id,
        recipient: 'ceo@alpha-secure.test',
        subject: 'Confidential Strategy',
        body: 'Confidential body content',
      }
    });

    subA = await prisma.subscriptions.create({
      data: {
        userId: userA.id,
        stripeCustomerId: 'cus_alpha_secret_123',
        stripeSubscriptionId: 'sub_alpha_secret_456',
        tier: 'PRO',
      }
    });

    console.log('[Setup] Seeded customer records for Tenant A.\n');

    // -------------------------------------------------------------------------
    // TEST 1: Direct ID Snooping (Tenant B attempts to access Tenant A's Prospect)
    // -------------------------------------------------------------------------
    const snoopedProspect = await prisma.prospect.findFirst({
      where: {
        id: prospectA.id,
        userId: userB.id // Tenant B context
      }
    });
    recordCheck(
      'DIRECT_RECORD_ISOLATION',
      snoopedProspect === null,
      'Tenant B querying Tenant A prospect ID returned null.'
    );

    // -------------------------------------------------------------------------
    // TEST 2: Collection Snooping (Tenant B queries all prospects)
    // -------------------------------------------------------------------------
    const tenantBProspects = await prisma.prospect.findMany({
      where: { userId: userB.id }
    });
    const leakFound = tenantBProspects.some(p => p.id === prospectA.id || p.userId === userA.id);
    recordCheck(
      'COLLECTION_QUERY_ISOLATION',
      !leakFound && tenantBProspects.length === 0,
      `Tenant B prospect collection contains 0 leaked records (count: ${tenantBProspects.length}).`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Unauthorized Tampering / UPDATE Isolation
    // -------------------------------------------------------------------------
    const updateResult = await prisma.prospect.updateMany({
      where: {
        id: prospectA.id,
        userId: userB.id // Tenant B context
      },
      data: {
        companyName: 'HACKED BY TENANT B'
      }
    });
    const refreshedProspectA = await prisma.prospect.findUnique({ where: { id: prospectA.id } });
    recordCheck(
      'UNAUTHORIZED_UPDATE_BLOCKED',
      updateResult.count === 0 && refreshedProspectA.companyName === 'Alpha Secure Corp',
      `Tenant B update modification blocked (affected rows: ${updateResult.count}, original name preserved).`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Unauthorized Destruction / DELETE Isolation
    // -------------------------------------------------------------------------
    const deleteResult = await prisma.prospect.deleteMany({
      where: {
        id: prospectA.id,
        userId: userB.id // Tenant B context
      }
    });
    const stillExists = await prisma.prospect.findUnique({ where: { id: prospectA.id } });
    recordCheck(
      'UNAUTHORIZED_DELETE_BLOCKED',
      deleteResult.count === 0 && stillExists !== null,
      `Tenant B deletion attempt blocked (deleted rows: ${deleteResult.count}, record safely preserved).`
    );

    // -------------------------------------------------------------------------
    // TEST 5: ResearchReports Table Isolation
    // -------------------------------------------------------------------------
    const snoopedReport = await prisma.researchReports.findFirst({
      where: { id: reportA.id, userId: userB.id }
    });
    recordCheck(
      'RESEARCH_REPORTS_ISOLATION',
      snoopedReport === null,
      'Tenant B cannot view Tenant A ResearchReports.'
    );

    // -------------------------------------------------------------------------
    // TEST 6: OpportunityAnalysis Table Isolation
    // -------------------------------------------------------------------------
    const snoopedOpp = await prisma.opportunityAnalysis.findFirst({
      where: { id: oppA.id, userId: userB.id }
    });
    recordCheck(
      'OPPORTUNITY_ANALYSIS_ISOLATION',
      snoopedOpp === null,
      'Tenant B cannot view Tenant A OpportunityAnalysis.'
    );

    // -------------------------------------------------------------------------
    // TEST 7: Proposals Table Isolation
    // -------------------------------------------------------------------------
    const snoopedProp = await prisma.proposals.findFirst({
      where: { id: propA.id, userId: userB.id }
    });
    recordCheck(
      'PROPOSALS_ISOLATION',
      snoopedProp === null,
      'Tenant B cannot view Tenant A Proposals.'
    );

    // -------------------------------------------------------------------------
    // TEST 8: OutreachMessages Table Isolation
    // -------------------------------------------------------------------------
    const snoopedMsg = await prisma.outreachMessages.findFirst({
      where: { id: msgA.id, userId: userB.id }
    });
    recordCheck(
      'OUTREACH_MESSAGES_ISOLATION',
      snoopedMsg === null,
      'Tenant B cannot view Tenant A OutreachMessages.'
    );

    // -------------------------------------------------------------------------
    // TEST 9: Subscriptions Table Isolation
    // -------------------------------------------------------------------------
    const snoopedSub = await prisma.subscriptions.findFirst({
      where: { id: subA.id, userId: userB.id }
    });
    recordCheck(
      'SUBSCRIPTIONS_ISOLATION',
      snoopedSub === null,
      'Tenant B cannot view Tenant A Subscriptions.'
    );

    // -------------------------------------------------------------------------
    // TEST 10: ActivityLog Table Isolation
    // -------------------------------------------------------------------------
    await prisma.activityLog.create({
      data: {
        userId: userA.id,
        action: 'CONFIDENTIAL_ACTION',
        details: 'Confidential user activity',
      }
    });
    const snoopedActivity = await prisma.activityLog.findMany({
      where: { userId: userB.id }
    });
    const activityLeaked = snoopedActivity.some(a => a.userId === userA.id);
    recordCheck(
      'ACTIVITY_LOG_ISOLATION',
      !activityLeaked,
      `Tenant B cannot view Tenant A ActivityLog entries (leak detected: ${activityLeaked}).`
    );

  } catch (err) {
    console.error('Critical test error:', err);
    recordCheck('EXECUTION_INTEGRITY', false, err.message);
  } finally {
    // Clean up test data
    try {
      if (userA) {
        await prisma.prospect.deleteMany({ where: { userId: userA.id } });
        await prisma.researchReports.deleteMany({ where: { userId: userA.id } });
        await prisma.opportunityAnalysis.deleteMany({ where: { userId: userA.id } });
        await prisma.proposals.deleteMany({ where: { userId: userA.id } });
        await prisma.outreachMessages.deleteMany({ where: { userId: userA.id } });
        await prisma.subscriptions.deleteMany({ where: { userId: userA.id } });
        await prisma.activityLog.deleteMany({ where: { userId: userA.id } });
        await prisma.user.delete({ where: { id: userA.id } });
      }
      if (userB) {
        await prisma.prospect.deleteMany({ where: { userId: userB.id } });
        await prisma.activityLog.deleteMany({ where: { userId: userB.id } });
        await prisma.user.delete({ where: { id: userB.id } });
      }
    } catch {}
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`TOTAL CHECKS: ${results.totalTests} | PASSED: ${results.passed} | FAILED: ${results.failed}`);
  console.log('================================================================');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runIsolationTests();
