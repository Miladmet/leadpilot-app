import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Telemetry View-Tracking API for Client Proposals & Audits
 * 
 * POST /api/audit/[id]/track
 * Records view-engagement telemetry (PAGE_OPENED, PRICING_VIEWED) via non-blocking beacons.
 * 
 * GET /api/audit/[id]/track
 * Returns live engagement telemetry for the authenticated owning agency.
 */

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospectId = params.id;
    if (!prospectId) {
      return NextResponse.json({ error: 'Prospect ID required' }, { status: 400 });
    }

    // Attempt to parse payload safely
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Beacon sent as text/plain or empty
    }

    const event = body?.event || 'PAGE_OPENED';
    const metadata = body?.metadata || {};

    // Check if the prospect exists in the database
    let prospect = null;
    try {
      prospect = await prisma.prospect.findUnique({
        where: { id: prospectId },
        select: { id: true, userId: true, companyName: true, websiteUrl: true },
      });
    } catch (dbErr) {
      console.warn('[Tracking Route] DB query failed:', dbErr);
    }

    // If prospect is not found (e.g. demo/sample audits), acknowledge politely without error
    if (!prospect) {
      return NextResponse.json({
        success: true,
        tracked: false,
        reason: 'sample_or_unregistered',
      });
    }

    // Map action type
    const action = event === 'PRICING_VIEWED' 
      ? 'PROPOSAL_PRICING_VIEWED' 
      : event === 'PROPOSAL_COPIED'
      ? 'PROPOSAL_COPIED'
      : 'PROPOSAL_VIEWED';

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'direct';
    const userAgent = req.headers.get('user-agent') || 'browser';
    const referer = req.headers.get('referer') || '';

    // Log engagement activity linked to owning user
    await prisma.activityLog.create({
      data: {
        userId: prospect.userId,
        action,
        details: JSON.stringify({
          prospectId: prospect.id,
          companyName: prospect.companyName,
          websiteUrl: prospect.websiteUrl,
          event,
          ip: clientIp,
          userAgent: userAgent.slice(0, 200),
          referer: referer.slice(0, 200),
          timestamp: new Date().toISOString(),
          ...metadata,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      tracked: true,
      event,
    });
  } catch (error: any) {
    console.error('[Tracking Route Error]:', error);
    // Beacons should fail silently with 200/202 to avoid disturbing visitor experience
    return NextResponse.json({ success: false, error: 'Tracking suppressed' }, { status: 200 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prospectId = params.id;
    if (!prospectId) {
      return NextResponse.json({ error: 'Prospect ID required' }, { status: 400 });
    }

    // Retrieve recent engagement activity for this user
    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        action: { in: ['PROPOSAL_VIEWED', 'PROPOSAL_PRICING_VIEWED', 'PROPOSAL_COPIED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Filter logs for this specific prospect
    const prospectLogs = logs.filter((log) => {
      try {
        const parsed = JSON.parse(log.details);
        return parsed.prospectId === prospectId;
      } catch {
        return log.details.includes(prospectId);
      }
    });

    const totalViews = prospectLogs.filter((l) => l.action === 'PROPOSAL_VIEWED').length;
    const pricingViews = prospectLogs.filter((l) => l.action === 'PROPOSAL_PRICING_VIEWED').length;
    const lastViewedAt = prospectLogs.length > 0 ? prospectLogs[0].createdAt : null;

    return NextResponse.json({
      success: true,
      prospectId,
      totalViews,
      pricingViews,
      hasPricingViewed: pricingViews > 0,
      lastViewedAt,
      history: prospectLogs.slice(0, 10).map((l) => ({
        id: l.id,
        action: l.action,
        createdAt: l.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('[Tracking Route GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
