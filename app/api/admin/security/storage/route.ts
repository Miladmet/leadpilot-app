import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { auditStorageBuckets } from '@/lib/storage/buckets';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
    }

    const audit = auditStorageBuckets();

    return NextResponse.json({
      success: true,
      metrics: {
        protectedBuckets: audit.protectedBucketsCount,
        publicBuckets: audit.publicBucketsCount,
        privateBuckets: audit.privateBucketsCount,
        totalBuckets: audit.totalBuckets,
        signedUrlProtection: audit.signedUrlProtection,
        ownershipChecks: audit.ownershipChecks,
        unauthorizedAccessTests: audit.unauthorizedAccessTests,
        storageSecurityScore: audit.storageSecurityScore,
        isSecure: audit.isSecure,
      },
      buckets: audit.buckets,
      failedChecks: audit.failedChecks,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Storage Security Status API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal storage audit error' }, { status: 500 });
  }
}
