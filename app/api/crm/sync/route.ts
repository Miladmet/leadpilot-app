import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prospectId, crmWebhookUrl } = await req.json();
    if (!prospectId) {
      return NextResponse.json({ error: 'Prospect ID is required' }, { status: 400 });
    }

    // Retrieve prospect data from database
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect || prospect.userId !== userId) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Default webhook endpoint from environment or a fallback simulator hook
    const webhookUrl = crmWebhookUrl || process.env.CRM_WEBHOOK_URL || 'https://httpbin.org/post';

    let recommendationsList = [];
    try {
      recommendationsList = JSON.parse(prospect.recommendations) || [];
    } catch (e) {}

    // Format CRM pipeline deal payload
    const payload = {
      dealName: `${prospect.companyName} - LeadPilot Opportunity`,
      website: prospect.websiteUrl,
      source: 'LeadPilot AI',
      opportunityValueRange: prospect.opportunityRange,
      evidenceQualityScore: `${prospect.evidenceQuality}%`,
      verificationPassRate: `${prospect.verificationPassRate}%`,
      reliabilityScore: `${prospect.findingReliability}%`,
      executiveSummary: prospect.executiveSummary,
      suggestedServices: recommendationsList.map((r: any) => ({
        service: r.serviceName,
        priority: r.priority || 'Strong',
        fee: r.estimatedFee,
        calcFormula: r.calculation
      })),
      timestamp: new Date().toISOString()
    };

    // Post to the webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`CRM Hook returned status code: ${response.status}`);
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'SYNCED_CRM',
        details: `Synced ${prospect.companyName} details to CRM hook: ${webhookUrl}`,
      },
    });

    return NextResponse.json({ success: true, url: webhookUrl });
  } catch (error: any) {
    console.error('CRM Sync Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync opportunity details to CRM.' },
      { status: 500 }
    );
  }
}
