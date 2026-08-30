import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { runSchemaVerification } from '@/lib/schemaVerification';
import { isSchemaMismatchError, parsePrismaSchemaError, USER_FACING_SCHEMA_ERROR } from '@/lib/schemaErrorLogger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 403 });
    }

    const verificationResult = await runSchemaVerification();

    return NextResponse.json({
      success: true,
      ...verificationResult
    });
  } catch (error: any) {
    if (isSchemaMismatchError(error)) {
      parsePrismaSchemaError(error, '/api/admin/security/schema-health');
      return NextResponse.json({ error: USER_FACING_SCHEMA_ERROR }, { status: 500 });
    }

    console.error('[Schema Health API Error]:', error);
    return NextResponse.json({ error: 'Failed to inspect database schema health.' }, { status: 500 });
  }
}
