import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { getDeploymentHistory, runAutomaticPostDeployValidation } from '@/lib/postDeployValidation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const history = getDeploymentHistory();
    return NextResponse.json({
      success: true,
      history,
      latest: history[0] || null
    });
  } catch (error: any) {
    console.error('[Deployment History API Error]:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to retrieve deployment history'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const validation = await runAutomaticPostDeployValidation(prisma);
    return NextResponse.json({
      success: true,
      validation
    });
  } catch (error: any) {
    console.error('[Trigger Post-Deploy Validation Error]:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to run post-deploy validation'
    }, { status: 500 });
  }
}
