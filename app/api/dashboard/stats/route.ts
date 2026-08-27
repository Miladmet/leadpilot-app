import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Count prospects
    const prospectsCount = await prisma.prospect.count({
      where: { userId },
    });

    // 2. Fetch prospects scores for average
    const prospects = await prisma.prospect.findMany({
      where: { userId },
      select: {
        opportunityScore: true,
        buyingSignalScore: true,
      },
    });

    let avgOppScore = 0;
    let avgBuyScore = 0;
    if (prospects.length > 0) {
      const sumOpp = prospects.reduce((acc, p) => acc + p.opportunityScore, 0);
      const sumBuy = prospects.reduce((acc, p) => acc + p.buyingSignalScore, 0);
      avgOppScore = Math.round(sumOpp / prospects.length);
      avgBuyScore = Math.round(sumBuy / prospects.length);
    }

    // 3. Get recent activities
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 4. Get recent prospects
    const recentProspects = await prisma.prospect.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

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
