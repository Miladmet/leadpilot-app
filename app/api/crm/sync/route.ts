import { NextRequest, NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/tenantPrisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { withTimeout, withRetry, TIMEOUT_LIMITS, crmQueue } from '@/lib/stability';

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

    const tenantDb = getTenantPrisma(userId);

    // Retrieve prospect data from database
    const prospect = await tenantDb.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found or unauthorized' }, { status: 404 });
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

    // Execute CRM sync with 15s timeout protection and 3-attempt exponential backoff
    try {
      await withTimeout(
        withRetry(
          async () => {
            const response = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              throw new Error(`CRM Webhook responded with status ${response.status}`);
            }
            return response;
          },
          { maxRetries: 3, backoffMs: 300, operationName: 'CRM Sync' }
        ),
        TIMEOUT_LIMITS.CRM_SYNC_MS,
        'CRM Sync'
      );

      // Log Activity
      await tenantDb.activityLog.create({
        data: {
          action: 'SYNCED_CRM',
          details: `Synced ${prospect.companyName} details to CRM hook: ${webhookUrl}`,
        },
      });

      return NextResponse.json({ success: true, status: 'Synced', url: webhookUrl });
    } catch (syncError: any) {
      // CRM FAULT ISOLATION: Never crash or block LeadPilot if CRM fails
      console.warn(`[CRM Sync Safety] CRM unavailable or timed out: ${syncError.message}. Queuing request.`);
      
      const queuedItem = crmQueue.enqueue({
        prospectId: prospect.id,
        crmType: webhookUrl.includes('hubspot') ? 'HubSpot' : webhookUrl.includes('salesforce') ? 'Salesforce' : 'Webhook',
        payload
      });

      return NextResponse.json({
        success: true,
        status: 'Sync Pending',
        queued: true,
        queueId: queuedItem.id,
        message: 'CRM endpoint unavailable; sync request queued for automatic retry.'
      }, { status: 202 });
    }
  } catch (error: any) {
    console.error('CRM Sync Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process CRM sync request.' },
      { status: 500 }
    );
  }
}

