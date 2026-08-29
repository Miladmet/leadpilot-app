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

    // Determine active webhook endpoint (custom URL, environment variable, or local simulator)
    let webhookUrl = crmWebhookUrl || process.env.CRM_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.trim() === '') {
      webhookUrl = 'http://localhost:3000/api/crm/mock';
    }

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
    let response;
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (fetchErr: any) {
      throw new Error(`Could not connect to CRM webhook (${webhookUrl}): ${fetchErr.message}`);
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `CRM Webhook endpoint returned 404 Not Found. The webhook URL (${webhookUrl}) appears to be deleted or expired. Please check your Zapier / CRM settings or use the local simulator.`
        );
      }
      throw new Error(`CRM Webhook returned status code ${response.status}`);
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
