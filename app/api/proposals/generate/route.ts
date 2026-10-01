import { NextRequest, NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/tenantPrisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantPrisma(userId);
    const body = await req.json();
    const { opportunity } = body;

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity is required' }, { status: 400 });
    }

    // Auto-generate proposal content from Opportunity Intelligence
    const title = `Strategic Proposal: ${opportunity.title}`;
    
    // Fill the new PIE fields
    const newProposal = await tenantDb.proposals.create({
      data: {
        userId,
        prospectId: opportunity.prospectId,
        title,
        status: 'Ready',
        
        // PIE mappings
        executiveSummary: `This proposal outlines a strategic approach to address the primary bottleneck identified at ${opportunity.prospectName}: ${opportunity.title}. By implementing this solution, we project a substantial increase in operational efficiency and revenue capture.`,
        problem: opportunity.description || 'Current processes show inefficiencies that lead to revenue leakage.',
        evidence: opportunity.evidence || 'Analyzed via intelligent multi-source evidence engine.',
        opportunity: opportunity.whyThisMatters || 'Fixing this bottleneck represents a high-leverage growth lever.',
        valueEstimate: `$${(opportunity.potentialRevenue || 0).toLocaleString()}`,
        recommendedServices: JSON.stringify([{ serviceName: opportunity.title, fee: opportunity.potentialRevenue }]),
        timeline: opportunity.effort === 'Low' ? '2-4 Weeks' : (opportunity.effort === 'Medium' ? '4-6 Weeks' : '6-8 Weeks'),
        nextSteps: '1. Review Proposal\n2. Approve Scope of Work\n3. Kickoff Meeting',
        
        confidenceRating: opportunity.confidence || 85,
        evidenceScore: opportunity.source === 'Combined' ? 95 : 80,
        trustScore: opportunity.confidence || 90,
      }
    });

    return NextResponse.json({ success: true, proposal: newProposal });
  } catch (error: any) {
    console.error('Generate Proposal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
