import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { validateAttachment } from '@/lib/storage/attachmentValidator';
import { registerFileMetadata } from '@/lib/storage/ownership';
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

    // 1. Enforce attachment security & virus scanning hook
    const validation = await validateAttachment(bucket, file.name, file.type, buffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, virusScanStatus: validation.virusScanStatus },
        { status: 400 }
      );
    }

    // 2. Register file ownership metadata
    const fileId = `${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const metadata = registerFileMetadata({
      file_id: fileId,
      bucket,
      file_name: file.name,
      owner_user_id: userId,
      organization_id: organizationId,
      file_type: file.type,
      file_size: buffer.length,
      virus_scan_status: validation.virusScanStatus,
      content: buffer,
    });

    // 3. Generate immediate 15-minute signed URL
    const signedUrl = generateSignedUrl(bucket, fileId, userId, 15 * 60);

    return NextResponse.json({
      success: true,
      file: metadata,
      signedUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });

  } catch (error: any) {
    console.error('Storage Upload Error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed.' }, { status: 500 });
  }
}
