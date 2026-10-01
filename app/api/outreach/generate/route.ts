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

    // Determine the evidence sources
    let evidenceSources = '[]';
    try {
      evidenceSources = JSON.stringify([{ type: opportunity.source, confidence: opportunity.confidence }]);
    } catch(e) {}

    // Generate Outreach Intelligence Engine outputs
    const newOutreach = await tenantDb.outreachMessages.create({
      data: {
        userId,
        prospectId: opportunity.prospectId,
        opportunityTitle: opportunity.title,
        problemRef: opportunity.description || 'Inefficient processes',
        evidenceRef: opportunity.evidence || 'Analyzed via intelligent multi-source evidence engine.',
        serviceRef: opportunity.title,
        
        coldEmail: `Hi there,\n\nI noticed an opportunity regarding ${opportunity.title} at ${opportunity.prospectName}. Our evidence engine flagged: "${opportunity.evidence.substring(0, 80)}...". \n\nWe specialize in solving exactly this problem. Are you open to a quick chat?`,
        linkedInMessage: `Hi, I was analyzing ${opportunity.prospectName}'s setup and saw a gap in ${opportunity.title}. I have a verified strategy that can generate an estimated $${opportunity.potentialRevenue.toLocaleString()} in upside. Let's connect!`,
        followUpSequence: JSON.stringify([
          `Checking in on my previous note regarding ${opportunity.title}.`,
          `I put together a quick case study on how we fix ${opportunity.description.substring(0, 50)}. Worth a look?`
        ]),
        discoveryQuestions: JSON.stringify([
          `How are you currently handling ${opportunity.title}?`,
          `Are you aware of the $${opportunity.potentialRevenue.toLocaleString()} revenue gap caused by ${opportunity.description.substring(0, 50)}?`
        ]),
        proposalCoverLetter: `Dear Team,\n\nBased on our evidence-backed analysis, we are pleased to present this proposal to resolve your ${opportunity.title} bottleneck. Addressing this ${opportunity.description.substring(0, 50)}... will unlock significant growth.`,
        
        outreachConfidence: opportunity.confidence || 85,
        personalizationScore: opportunity.source === 'Combined' ? 98 : (opportunity.source === 'MCP' ? 92 : 80),
        evidenceSources,
        status: 'Draft',
      }
    });

    return NextResponse.json({ success: true, outreach: newOutreach });
  } catch (error: any) {
    console.error('Generate Outreach Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
