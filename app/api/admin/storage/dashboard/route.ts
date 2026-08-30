import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { getStorageSecurityDashboardData } from '@/lib/storage/ownership';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
    }

    const data = getStorageSecurityDashboardData();

    return NextResponse.json({
      success: true,
      metrics: data.metrics,
      alerts: data.alerts,
      auditLogs: data.auditLogs,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Storage Dashboard API Error]:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch storage security dashboard data'
    }, { status: 500 });
  }
}
