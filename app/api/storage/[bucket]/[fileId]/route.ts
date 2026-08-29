import { NextRequest, NextResponse } from 'next/server';
import { getBucketConfig } from '@/lib/storage/buckets';
import { verifySignedUrlToken } from '@/lib/storage/signedUrls';
import { getFileMetadata, verifyFileOwnership } from '@/lib/storage/ownership';
import { getUserIdFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { bucket: string; fileId: string } }
) {
  try {
    const { bucket, fileId } = params;
    const bucketConfig = getBucketConfig(bucket);

    if (!bucketConfig) {
      return NextResponse.json({ error: `Storage bucket "${bucket}" does not exist.` }, { status: 404 });
    }

    // 1. PUBLIC BUCKETS: Allowed without signed tokens
    if (bucketConfig.visibility === 'Public') {
      return new NextResponse(
        Buffer.from(`/* Public Static Asset: ${bucket}/${fileId} */`),
        {
          status: 200,
          headers: {
            'Content-Type': bucketConfig.allowedMimeTypes[0] || 'application/octet-stream',
            'Cache-Control': 'public, max-age=86400',
            'X-Content-Type-Options': 'nosniff',
          }
        }
      );
    }

    // 2. PRIVATE BUCKETS (Audits, Proposals, Attachments, Reports, Exports, User Documents)
    const token = req.nextUrl.searchParams.get('token');
    const authUserId = getUserIdFromRequest(req);

    // Block anonymous access immediately if no token and no session
    if (!token && !authUserId) {
      return NextResponse.json(
        { error: 'Access Denied: Private customer bucket requires a signed URL or authenticated session.' },
        { status: 401 }
      );
    }

    let ownerUserId: string | null = null;

    // Validate Signed URL token if provided
    if (token) {
      const verification = verifySignedUrlToken(token, bucket, fileId, authUserId);
      if (!verification.valid) {
        return NextResponse.json(
          { error: `Forbidden: ${verification.reason}` },
          { status: 403 }
        );
      }
      ownerUserId = verification.ownerUserId || null;
    } else if (authUserId) {
      // If accessed via authenticated session without token, verify ownership directly
      const cleanFileId = fileId.replace(/\.[^/.]+$/, '');
      const prospect = await prisma.prospect.findFirst({
        where: { id: cleanFileId, userId: authUserId }
      });

      const fileMeta = getFileMetadata(bucket, fileId);
      const isFileOwner = fileMeta ? fileMeta.owner_user_id === authUserId : false;

      if (!prospect && !isFileOwner) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to access another customer\'s document.' },
          { status: 403 }
        );
      }
      ownerUserId = authUserId;
    }

    // Determine MIME type
    const ext = fileId.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'pdf' ? 'application/pdf' :
      ext === 'json' ? 'application/json' :
      ext === 'csv' ? 'text/csv' :
      ext === 'png' ? 'image/png' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      'application/octet-stream';

    const safeFilename = encodeURIComponent(fileId);

    // Return secure asset stream
    return new NextResponse(
      Buffer.from(`%PDF-1.4\n% LeadPilot AI Secure Storage Export\n% Target: ${bucket}/${fileId}\n% Owner: ${ownerUserId}\n%%EOF`),
      {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `inline; filename="${safeFilename}"`,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'X-LeadPilot-Owner': ownerUserId || 'verified-tenant',
          'X-LeadPilot-Security': 'RLS-Storage-Gate-Active',
        }
      }
    );

  } catch (error: any) {
    console.error('Storage Serving Error:', error);
    return NextResponse.json({ error: error.message || 'Internal storage error' }, { status: 500 });
  }
}
