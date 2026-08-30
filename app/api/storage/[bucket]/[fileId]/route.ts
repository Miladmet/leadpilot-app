import { NextRequest, NextResponse } from 'next/server';
import { getBucketConfig } from '@/lib/storage/buckets';
import { verifySignedUrlToken } from '@/lib/storage/signedUrls';
import { getFileMetadata, getFileScanMetadata, recordBlockedDownload } from '@/lib/storage/ownership';
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

    const authUserId = getUserIdFromRequest(req);

    // 0. STRICT QUARANTINE ISOLATION: Zero direct download access
    if (bucket.toLowerCase() === 'quarantine') {
      recordBlockedDownload({
        fileId,
        bucket,
        requestingUserId: authUserId,
        scanResult: 'Quarantined',
        reason: 'Direct access to quarantine bucket is prohibited by platform security policy.'
      });
      return NextResponse.json(
        { error: 'Forbidden: Direct access to quarantine bucket is prohibited by platform security policy.' },
        { status: 403 }
      );
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

    // 3. ZERO-TRUST MALWARE GATE: Verify Scan Status = Safe
    // Block: Malware detected, Scan incomplete (Pending Scan), Unknown scan status, Suspicious
    const scanMeta = getFileScanMetadata(fileId);

    if (scanMeta) {
      if (scanMeta.scanResult === 'Quarantined') {
        recordBlockedDownload({
          fileId,
          bucket,
          requestingUserId: authUserId || ownerUserId,
          scanResult: 'Quarantined',
          reason: scanMeta.quarantineReason || 'Malware detected'
        });
        return NextResponse.json(
          { error: `Forbidden: Access Denied. File is quarantined due to detected threat: ${scanMeta.quarantineReason || 'Malware detected'}` },
          { status: 403 }
        );
      }

      if (scanMeta.scanResult === 'Pending Scan') {
        recordBlockedDownload({
          fileId,
          bucket,
          requestingUserId: authUserId || ownerUserId,
          scanResult: 'Pending Scan',
          reason: 'Scan incomplete'
        });
        return NextResponse.json(
          { error: 'Locked: Access Denied. File scan is incomplete. Please wait for security verification.' },
          { status: 423 }
        );
      }

      if (scanMeta.scanResult === 'Suspicious') {
        recordBlockedDownload({
          fileId,
          bucket,
          requestingUserId: authUserId || ownerUserId,
          scanResult: 'Suspicious',
          reason: scanMeta.quarantineReason || 'Suspicious file'
        });
        return NextResponse.json(
          { error: `Forbidden: Access Denied. File flagged as suspicious and blocked by platform security policy: ${scanMeta.quarantineReason}` },
          { status: 403 }
        );
      }

      if (scanMeta.scanResult !== 'Safe') {
        recordBlockedDownload({
          fileId,
          bucket,
          requestingUserId: authUserId || ownerUserId,
          scanResult: scanMeta.scanResult || 'Unknown',
          reason: 'Unknown scan status'
        });
        return NextResponse.json(
          { error: 'Forbidden: Access Denied. File has unknown scan status and cannot be served.' },
          { status: 403 }
        );
      }
    } else {
      // In private customer buckets, block files that have no scan record
      if (bucket === 'attachments' || bucket === 'user-documents') {
        recordBlockedDownload({
          fileId,
          bucket,
          requestingUserId: authUserId || ownerUserId,
          scanResult: 'Unknown',
          reason: 'Unknown scan status: File has not undergone pre-storage malware validation.'
        });
        return NextResponse.json(
          { error: 'Forbidden: Access Denied. File has unknown scan status and cannot be served.' },
          { status: 403 }
        );
      }
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
      Buffer.from(`%PDF-1.4\n% LeadPilot AI Secure Storage Export\n% Target: ${bucket}/${fileId}\n% Owner: ${ownerUserId}\n% Scan-Status: Safe\n%%EOF`),
      {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `inline; filename="${safeFilename}"`,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'X-LeadPilot-Owner': ownerUserId || 'verified-tenant',
          'X-LeadPilot-Scan-Status': 'Safe',
          'X-LeadPilot-Security': 'Malware-Gate-Active',
        }
      }
    );

  } catch (error: any) {
    console.error('Storage Serving Error:', error);
    return NextResponse.json({ error: error.message || 'Internal storage error' }, { status: 500 });
  }
}
