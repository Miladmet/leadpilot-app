import { NextRequest, NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/tenantPrisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantPrisma(userId);

    // Fetch all Prospects, Proposals, and Outreach
    const [prospects, proposals, outreaches] = await Promise.all([
      tenantDb.prospect.findMany({ select: { id: true, recommendations: true } }),
      tenantDb.proposals.findMany({ select: { id: true, prospectId: true, valueEstimate: true, confidenceRating: true } }),
      tenantDb.outreachMessages.findMany({ select: { id: true, prospectId: true, opportunityTitle: true } })
    ]);

    let metrics = {
      potentialRevenue: 0,
      weightedRevenue: 0,
      proposalValue: 0,
      confidenceAdjustedRevenue: 0, // Same as weighted roughly, but we can compute explicitly
      quickWinRevenue: 0,
      longTermRevenue: 0
    };

    let funnel = {
      totalPotential: 0,
      qualifiedPotential: 0,
      proposalReady: proposals.length,
      outreachReady: outreaches.length,
      highConfidence: 0
    };

    // Calculate Opportunity Metrics
    prospects.forEach((p: any) => {
      let recs: any[] = [];
      try { recs = JSON.parse(p.recommendations || '[]'); } catch(e) {}

      recs.forEach((rec) => {
        const val = rec.estimatedValue || 0;
        const conf = rec.confidence || 0;
        
        let effort = 'Medium';
        if (val > 4000) effort = 'High';
        else if (val < 1000) effort = 'Low';
        if (rec.serviceName?.toLowerCase().includes('quick') || rec.serviceName?.toLowerCase().includes('speed')) {
          effort = 'Low';
        }

        // Metrics Accumulation
        metrics.potentialRevenue += val;
        metrics.weightedRevenue += val * (conf / 100);
        
        if (effort === 'Low') metrics.quickWinRevenue += val;
        if (effort === 'High' || effort === 'Medium') metrics.longTermRevenue += val;

        // Funnel Accumulation
        funnel.totalPotential++;
        if (conf >= 70) funnel.qualifiedPotential++;
        if (conf >= 90) funnel.highConfidence++;
      });
    });

    metrics.confidenceAdjustedRevenue = metrics.weightedRevenue;

    // Calculate Proposal Value
    proposals.forEach((prop: any) => {
      // valueEstimate is usually a string like "$5,000"
      const numStr = prop.valueEstimate.replace(/[^0-9]/g, '');
      const val = parseInt(numStr, 10) || 0;
      metrics.proposalValue += val;
    });

    return NextResponse.json({ success: true, metrics, funnel });
  } catch (error: any) {
    console.error('Revenue API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
