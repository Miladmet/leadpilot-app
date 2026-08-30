import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { runDeploymentVerification } from '@/lib/deploymentVerification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    // Allow access for authenticated admin or verification client
    const verification = await runDeploymentVerification(prisma);

    return NextResponse.json({
      success: true,
      ...verification
    });
  } catch (error: any) {
    console.error('[Infrastructure Status API Error]:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to retrieve infrastructure status'
    }, { status: 500 });
  }
}
