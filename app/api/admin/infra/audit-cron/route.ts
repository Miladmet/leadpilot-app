import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runDeploymentVerification } from '@/lib/deploymentVerification';

export const dynamic = 'force-dynamic';

/**
 * Nightly Drift Audit Cron Route
 * Can be triggered via Vercel Cron, GitHub Actions, or admin dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, enforce bearer token protection
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron trigger.' }, { status: 401 });
    }

    const verification = await runDeploymentVerification(prisma);

    // If drift is detected, log structured alert
    if (!verification.isDeploymentApproved || verification.alerts.length > 0) {
      console.warn('[NIGHTLY DRIFT AUDIT ALERT]: Schema drift or health degradation detected!');
      for (const alert of verification.alerts) {
        console.error(`[ALERT ${alert.severity}] (${alert.type}): ${alert.message}`);
      }
    } else {
      console.log('[NIGHTLY DRIFT AUDIT SUCCESS]: Database schema and core routes are 100% healthy.');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      auditPassed: verification.isDeploymentApproved,
      schemaHealthScore: verification.schemaHealth.score,
      alertsCount: verification.alerts.length,
      alerts: verification.alerts,
      platformStatus: verification.platformStatus
    });
  } catch (error: any) {
    console.error('[Nightly Drift Audit Error]:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
