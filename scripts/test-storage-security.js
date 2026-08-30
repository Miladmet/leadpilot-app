const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'leadpilot-secret-key-change-in-prod';

// Import storage security utilities from core
const {
  generateSignedUrl,
  verifySignedUrlToken,
  getBucketConfig,
  auditStorageBuckets,
  registerFileMetadata,
  getFileMetadata,
  validateAttachment
} = require('../lib/storage/core');


async function runStorageSecurityTests() {
  console.log('================================================================');
  console.log('       LEADPILOT STORAGE SECURITY GATE TEST RUNNER              ');
  console.log('================================================================\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function assertTest(testName, passed, details) {
    results.total++;
    if (passed) {
      results.passed++;
      console.log(`  [PASS] ${testName}: ${details}`);
    } else {
      results.failed++;
      console.error(`  [FAIL] ${testName}: ${details}`);
    }
    results.tests.push({ testName, passed, details });
  }

  let userA, userB, prospectA;

  try {
    const passwordHash = await bcrypt.hash('StorageTestPassword123!', 10);

    // 1. Provision User A
    userA = await prisma.user.upsert({
      where: { email: 'storage_tenant_a@leadpilot.test' },
      update: {},
      create: {
        email: 'storage_tenant_a@leadpilot.test',
        passwordHash,
        subscriptionTier: 'PRO',
      }
    });

    // 2. Provision User B
    userB = await prisma.user.upsert({
      where: { email: 'storage_tenant_b@leadpilot.test' },
      update: {},
      create: {
        email: 'storage_tenant_b@leadpilot.test',
        passwordHash,
        subscriptionTier: 'FREE',
      }
    });

    // 3. Seed User A Prospect
    prospectA = await prisma.prospect.create({
      data: {
        userId: userA.id,
        companyName: 'Private Health Records Inc',
        websiteUrl: 'https://private-health.test',
        opportunityScore: 90,
        buyingSignalScore: 95,
        potentialRevenue: 60000,
        closingProbability: 85,
        problemSeverity: 'High',
        leadQuality: 'Hot',
        verifiedFacts: '[]',
        aiInferences: '[]',
        buyingSignals: '[]',
        recommendations: '[]',
        scoreExplanations: '{}',
        executiveSummary: 'Confidential Audit for Health Records',
        expectedResults: 'High impact',
        estimatedRoi: '400%',
        thirtyDayPlan: 'Phase 1',
        ninetyDayPlan: 'Phase 2',
        pricingRecommendation: '$60,000',
        coldEmail: 'Confidential cold email',
        linkedInMessage: 'Confidential linkedin',
        discoveryScript: 'Confidential discovery',
        followUpSequence: 'Confidential sequence',
        meetingAgenda: 'Confidential agenda',
      }
    });

    console.log(`[Setup] User A (${userA.id.slice(0, 8)}) and User B (${userB.id.slice(0, 8)}) initialized.\n`);

    // -------------------------------------------------------------------------
    // TEST 1: User A uploads PDF -> User B attempts access -> Expected: 403 Forbidden
    // -------------------------------------------------------------------------
    console.log('Running Test 1: User A uploads PDF, User B attempts access...');
    const fileA = registerFileMetadata({
      file_id: `proposal_${prospectA.id}.pdf`,
      bucket: 'proposals',
      file_name: 'Confidential_Healthcare_Audit.pdf',
      owner_user_id: userA.id,
      organization_id: 'org_alpha_health',
      file_type: 'application/pdf',
      file_size: 1024 * 45,
      content: Buffer.from('%PDF-1.4 Confidential Healthcare Audit'),
    });

    // User A generates a valid signed URL for their own document
    const userASignedUrl = generateSignedUrl('proposals', fileA.file_id, userA.id, 900);
    const tokenA = new URL(`http://localhost${userASignedUrl}`).searchParams.get('token');

    // User B attempts to access User A's document using the token but in User B's context
    const userBAccessCheck = verifySignedUrlToken(tokenA, 'proposals', fileA.file_id, userB.id);

    assertTest(
      'TEST_1_CROSS_TENANT_ACCESS',
      userBAccessCheck.valid === false && userBAccessCheck.reason.includes('not the resource owner'),
      `User B blocked from accessing User A PDF document. (${userBAccessCheck.reason})`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Signed URL expires -> Expected: Access denied
    // -------------------------------------------------------------------------
    console.log('Running Test 2: Signed URL expires...');
    // Generate a signed URL with -1 second expiration (already expired)
    const expiredUrl = generateSignedUrl('proposals', fileA.file_id, userA.id, -1);
    const expiredToken = new URL(`http://localhost${expiredUrl}`).searchParams.get('token');

    const expiredCheck = verifySignedUrlToken(expiredToken, 'proposals', fileA.file_id, userA.id);

    assertTest(
      'TEST_2_SIGNED_URL_EXPIRATION',
      expiredCheck.valid === false && expiredCheck.reason.includes('expired'),
      `Expired signed URL rejected. (${expiredCheck.reason})`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Anonymous access -> Expected: Denied
    // -------------------------------------------------------------------------
    console.log('Running Test 3: Anonymous access to private customer bucket...');
    // Null token check against private bucket
    const anonCheck = verifySignedUrlToken('', 'proposals', fileA.file_id, null);

    assertTest(
      'TEST_3_ANONYMOUS_ACCESS_DENIED',
      anonCheck.valid === false && anonCheck.reason.includes('Missing signed URL'),
      `Anonymous unauthenticated request blocked. (${anonCheck.reason})`
    );

    // -------------------------------------------------------------------------
    // TEST 4: URL guessing attack -> Expected: Denied
    // -------------------------------------------------------------------------
    console.log('Running Test 4: URL guessing attack...');
    // Attacker attempts to forge a token by tampering with the payload
    const forgedToken = Buffer.from(JSON.stringify({
      bucket: 'proposals',
      fileId: fileA.file_id,
      ownerUserId: userB.id, // Forged owner
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      signature: 'deadbeef1234567890abcdefdeadbeef1234567890abcdefdeadbeef12345678' // Guessed signature
    })).toString('base64url');

    const guessCheck = verifySignedUrlToken(forgedToken, 'proposals', fileA.file_id, userB.id);

    assertTest(
      'TEST_4_URL_GUESSING_ATTACK',
      guessCheck.valid === false && guessCheck.reason.includes('Invalid or forged'),
      `Cryptographic signature validation blocked URL guessing attack. (${guessCheck.reason})`
    );

    // -------------------------------------------------------------------------
    // BONUS TEST 5: Attachment Security & Virus Scanner Hook
    // -------------------------------------------------------------------------
    console.log('Running Test 5: Virus scanning and file validation hook...');
    const maliciousBuffer = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
    const virusCheck = await validateAttachment('attachments', 'test_eicar.pdf', 'application/pdf', maliciousBuffer);

    assertTest(
      'TEST_5_VIRUS_SCANNER_HOOK',
      virusCheck.valid === false && virusCheck.virusScanStatus === 'INFECTED',
      `Malware payload intercepted by virus scanning hook. (${virusCheck.error})`
    );

    // -------------------------------------------------------------------------
    // BONUS TEST 6: Bucket Privacy Matrix Integrity
    // -------------------------------------------------------------------------
    const audit = auditStorageBuckets();
    assertTest(
      'TEST_6_BUCKET_CLASSIFICATION_INTEGRITY',
      audit.isSecure && audit.storageSecurityScore === 100 && audit.privateBucketsCount >= 6,
      `All ${audit.privateBucketsCount} customer data buckets are private with policies active. Score: ${audit.storageSecurityScore}%`
    );

  } catch (err) {
    console.error('Fatal test execution error:', err);
    assertTest('EXECUTION_EXCEPTION', false, err.message);
  } finally {
    // Cleanup
    try {
      if (prospectA) {
        await prisma.prospect.delete({ where: { id: prospectA.id } });
      }
      if (userA) {
        await prisma.user.delete({ where: { id: userA.id } });
      }
      if (userB) {
        await prisma.user.delete({ where: { id: userB.id } });
      }
    } catch {}
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`STORAGE TESTS: ${results.total} | PASSED: ${results.passed} | FAILED: ${results.failed}`);
  console.log('================================================================\n');

  if (results.failed > 0) {
    console.error('STORAGE SECURITY FAILED\n');
    process.exit(1);
  } else {
    console.log('STORAGE SECURITY PASSED\n');
    process.exit(0);
  }
}

runStorageSecurityTests();
