import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { validateAttachment } from '@/lib/storage/attachmentValidator';
import { registerFileMetadata, recordFileScan } from '@/lib/storage/ownership';
import { generateSignedUrl } from '@/lib/storage/signedUrls';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to upload files.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'attachments';
    const organizationId = (formData.get('organizationId') as string) || `org_${userId.slice(0, 8)}`;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form upload.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileId = `${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadTime = new Date().toISOString();

    // 1. Enforce attachment security, extension check, magic bytes & malware scanning
    const validation = await validateAttachment(bucket, file.name, file.type, buffer);
    if (!validation.valid) {
      // Record quarantined / suspicious file in malware ledger
      recordFileScan({
        fileId,
        userId,
        organizationId,
        uploadTime,
        scanResult: validation.scanResult || 'Quarantined',
        scanTime: validation.scanTime || new Date().toISOString(),
        fileName: file.name,
        fileSize: buffer.length,
        mimeType: file.type,
        bucket: 'quarantine',
        quarantineReason: validation.error,
        threatType: validation.threatType
      });

      return NextResponse.json(
        {
          error: validation.error,
          scanStatus: validation.scanResult || 'Quarantined',
          threatType: validation.threatType,
          quarantined: true,
          bucket: 'quarantine'
        },
        { status: 400 }
      );
    }

    // 2. Record verified Safe file metadata in ledger
    recordFileScan({
      fileId,
      userId,
      organizationId,
      uploadTime,
      scanResult: 'Safe',
      scanTime: validation.scanTime || new Date().toISOString(),
      fileName: file.name,
      fileSize: buffer.length,
      mimeType: file.type,
      bucket
    });

    // 3. Register file ownership metadata
    const metadata = registerFileMetadata({
      file_id: fileId,
      bucket,
      file_name: file.name,
      owner_user_id: userId,
      organization_id: organizationId,
      file_type: file.type,
      file_size: buffer.length,
      virus_scan_status: 'CLEAN',
      content: buffer,
    });

    // 4. Generate immediate 15-minute signed URL
    const signedUrl = generateSignedUrl(bucket, fileId, userId, 15 * 60);

    return NextResponse.json({
      success: true,
      file: metadata,
      scanStatus: 'Safe',
      signedUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });

  } catch (error: any) {
    console.error('Storage Upload Error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed.' }, { status: 500 });
  }
}
