import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateSignedUrl } from '@/lib/storage/signedUrls';
import { getBucketConfig } from '@/lib/storage/buckets';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to generate signed URLs.' }, { status: 401 });
    }

    const { bucket, fileId, prospectId } = await req.json();

    if (!bucket || !fileId) {
      return NextResponse.json({ error: 'bucket and fileId parameters are required.' }, { status: 400 });
    }

    const bucketConfig = getBucketConfig(bucket);
    if (!bucketConfig) {
      return NextResponse.json({ error: `Invalid bucket: "${bucket}"` }, { status: 400 });
    }

    // If prospectId is provided or if this is a proposal/audit/report file, verify user owns the prospect
    if (prospectId || bucketConfig.containsCustomerData) {
      const targetProspectId = prospectId || fileId.replace(/\.[^/.]+$/, ''); // handles "prospectId.pdf"
      const prospect = await prisma.prospect.findFirst({
        where: {
          id: targetProspectId,
          userId: userId, // Strict ownership check
        }
      });

      if (!prospect && bucketConfig.containsCustomerData) {
        return NextResponse.json(
          { error: 'Forbidden: You do not own this customer document or proposal.' },
          { status: 403 }
        );
      }
    }

    // Generate 15-minute cryptographically signed URL
    const signedUrl = generateSignedUrl(bucket, fileId, userId, 15 * 60);

    return NextResponse.json({
      success: true,
      bucket,
      fileId,
      signedUrl,
      expiresInSeconds: 15 * 60,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });

  } catch (error: any) {
    console.error('Signed URL API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate signed URL' }, { status: 500 });
  }
}
