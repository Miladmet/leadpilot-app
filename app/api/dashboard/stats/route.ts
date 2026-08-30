import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantPrisma } from '@/lib/tenantPrisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { 
  selfHealDatabaseSchema, 
  SAFE_CORE_PROSPECT_SELECT, 
  normalizeProspectDefaults 
} from '@/lib/dbSelfHeal';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantPrisma(userId);

    // 1. Count prospects
    const prospectsCount = await tenantDb.prospect.count({});

    // 2. Fetch prospects scores for average
    const prospects = await tenantDb.prospect.findMany({
      select: {
        opportunityScore: true,
        buyingSignalScore: true,
      },
    });

    let avgOppScore = 0;
    let avgBuyScore = 0;
    if (prospects.length > 0) {
      const sumOpp = prospects.reduce((acc: number, p: any) => acc + p.opportunityScore, 0);
      const sumBuy = prospects.reduce((acc: number, p: any) => acc + p.buyingSignalScore, 0);
      avgOppScore = Math.round(sumOpp / prospects.length);
      avgBuyScore = Math.round(sumBuy / prospects.length);
    }

    // 3. Get recent activities
    const activities = await tenantDb.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 4. Get recent prospects (resilient to schema drift)
    let recentProspects: any[] = [];
    try {
      recentProspects = await tenantDb.prospect.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    } catch (dbErr: any) {
      const errMsg = dbErr?.message || '';
      if (dbErr?.code === 'P2022' || errMsg.includes('analysisVersion') || errMsg.includes('does not exist')) {
        console.warn('[Dashboard Stats Route] P2022 detected on recentProspects. Invoking auto-heal...');
        await selfHealDatabaseSchema(prisma);
        try {
          recentProspects = await tenantDb.prospect.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
          });
        } catch (retryErr) {
          const rawRecent = await tenantDb.prospect.findMany({
            select: SAFE_CORE_PROSPECT_SELECT,
            orderBy: { createdAt: 'desc' },
            take: 5,
          });
          recentProspects = rawRecent.map(normalizeProspectDefaults);
        }
      } else {
        throw dbErr;
      }
    }


    return NextResponse.json({
      success: true,
      stats: {
        prospectsCount,
        outreachCount: prospectsCount * 2, // Each prospect has Cold Email + LinkedIn Message
        avgOppScore,
        avgBuyScore,
      },
      activities,
      recentProspects,
    });
  } catch (error: any) {
    console.error('Get Stats Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
