/**
 * LeadPilot Production Deployment Storage Security Gate
 * Blocks build/deployment if any customer storage bucket is public,
 * missing ownership policies, or fails unauthorized penetration tests.
 */

const { auditStorageBuckets, generateSignedUrl, verifySignedUrlToken, registerFileMetadata } = require('../lib/storage/core');

function verifyStorageSecurity() {
  console.log('----------------------------------------------------------------');
  console.log('  [STORAGE SECURITY GATE] Auditing Cloud Storage Isolation      ');
  console.log('----------------------------------------------------------------');

  const audit = auditStorageBuckets();
  let failureReason = null;

  console.log('Auditing storage bucket privacy classifications:');
  audit.buckets.forEach(b => {
    const symbol = b.status === 'PROTECTED' ? '✅' : '❌';
    console.log(`  ${symbol} ${b.name} (${b.visibility}) -> Customer Data: ${b.containsCustomerData ? 'YES' : 'NO'}, Policies: ${b.storagePolicies}`);
  });

  // 1. Check if any bucket containing customer data is public
  const publicCustomerBuckets = audit.buckets.filter(b => b.containsCustomerData && b.visibility !== 'Private');
  if (publicCustomerBuckets.length > 0) {
    failureReason = `Customer buckets exposed to public: ${publicCustomerBuckets.map(b => b.name).join(', ')}`;
  }

  // 2. Check if any private bucket is missing ownership policies
  const missingPolicyBuckets = audit.buckets.filter(b => b.visibility === 'Private' && b.storagePolicies !== 'Present');
  if (missingPolicyBuckets.length > 0) {
    failureReason = `Private buckets missing policies: ${missingPolicyBuckets.map(b => b.name).join(', ')}`;
  }

  // 3. Verify signed URL protection is active
  if (audit.signedUrlProtection !== 'Enabled') {
    failureReason = 'Signed URL protection is not enabled.';
  }

  // 4. Run instant penetration test (Tenant cross-access block)
  try {
    const testFile = registerFileMetadata({
      file_id: 'gate_test_doc_001.pdf',
      bucket: 'audits',
      file_name: 'gate_test_doc_001.pdf',
      owner_user_id: 'tenant_user_gate_alpha',
      organization_id: 'org_gate_alpha',
      file_type: 'application/pdf',
      file_size: 1024,
      content: Buffer.from('Confidential Audit Gate Payload'),
    });

    const signedUrl = generateSignedUrl('audits', testFile.file_id, 'tenant_user_gate_alpha', 900);
    const token = new URL(`http://localhost${signedUrl}`).searchParams.get('token');

    // Attacker context (Tenant Bravo)
    const attackerCheck = verifySignedUrlToken(token, 'audits', testFile.file_id, 'tenant_user_gate_bravo');
    if (attackerCheck.valid) {
      failureReason = 'Unauthorized cross-tenant penetration test failed: Tenant Bravo accessed Tenant Alpha document!';
    }
  } catch (err) {
    failureReason = `Penetration test runtime error: ${err.message}`;
  }

  console.log('\nAudit Results:');
  console.log(`  Protected Buckets: ${audit.protectedBucketsCount}`);
  console.log(`  Public Buckets: ${audit.publicBucketsCount}`);
  console.log(`  Private Buckets: ${audit.privateBucketsCount}`);
  console.log(`  Signed URL Protection: ${audit.signedUrlProtection}`);
  console.log(`  Ownership Checks: ${audit.ownershipChecks}`);
  console.log(`  Unauthorized Access Tests: ${audit.unauthorizedAccessTests}`);
  console.log(`  Storage Security Score: ${audit.storageSecurityScore}%`);

  if (failureReason) {
    console.error('\n================================================================');
    console.error('🚨 CRITICAL STORAGE SECURITY GATE FAILURE: DEPLOYMENT BLOCKED!');
    console.error(`Violation: ${failureReason}`);
    console.error('Customer documents, proposals, or attachments are at risk.');
    console.error('================================================================\n');
    console.log('STORAGE SECURITY FAILED\n');
    process.exit(1);
  }

  console.log('\n----------------------------------------------------------------');
  console.log('STORAGE SECURITY PASSED');
  console.log('----------------------------------------------------------------\n');
  process.exit(0);
}

verifyStorageSecurity();
