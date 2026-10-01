import { NextRequest, NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/tenantPrisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { withTimeout, withRetry, TIMEOUT_LIMITS, crmQueue } from '@/lib/stability';

async function sendWebhook(url: string, payload: object, label: string) {
  return withTimeout(
    withRetry(
      async () => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`${label} responded with ${res.status}`);
        return res;
      },
      { maxRetries: 3, backoffMs: 300, operationName: label }
    ),
    TIMEOUT_LIMITS.CRM_SYNC_MS,
    label
  );
}

function buildHubSpotOpportunityPayload(opportunity: any) {
  // Sync: Opportunity Score, Potential Revenue, Evidence Summary, Proposal Link, Trust Score
  return {
    properties: {
      dealname: `${opportunity.prospectName} - ${opportunity.title}`,
      amount: opportunity.potentialRevenue || 0,
      opportunity_score: opportunity.confidence || 0,
      trust_score: opportunity.confidence || 0,
      evidence_summary: opportunity.evidence || '',
      proposal_link: `https://leadpilot.app/proposals/generate?oppId=${opportunity.id}`,
      dealstage: 'appointmentscheduled',
      pipeline: 'default',
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunity } = await req.json();
    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity is required' }, { status: 400 });
    }

    const tenantDb = getTenantPrisma(userId);

    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL?.trim() || '';
    const fallback = 'http://localhost:3000/api/crm/mock';

    const destinations: { url: string; payload: object; label: string }[] = [];
    
    if (hubspotUrl) {
      destinations.push({ url: hubspotUrl, payload: buildHubSpotOpportunityPayload(opportunity), label: 'HubSpot' });
    } else {
      // Mock CRM fallback locally for testing
      destinations.push({ url: fallback, payload: buildHubSpotOpportunityPayload(opportunity), label: 'HubSpot (Mock)' });
    }

    const results = await Promise.allSettled(
      destinations.map(({ url, payload, label }) =>
        sendWebhook(url, payload, label)
          .then(() => ({ label, status: 'synced', url }))
          .catch((err: Error) => {
            console.warn(`[CRM Fault Isolation] ${label} failed: ${err.message}. Queuing.`);
            const queued = crmQueue.enqueue({ prospectId: opportunity.prospectId, crmType: label, payload });
            return { label, status: 'queued', url, queueId: queued.id };
          })
      )
    );

    const summary = results.map(r => r.status === 'fulfilled' ? r.value : { label: '?', status: 'error' });
    const anySynced = summary.some(s => s.status === 'synced');

    // Log the action
    await tenantDb.activityLog.create({
      data: {
        action: 'SYNCED_OPPORTUNITY_CRM',
        details: `Synced Opportunity to HubSpot: ${opportunity.title} for ${opportunity.prospectName}`,
      },
    });

    return NextResponse.json(
      { success: true, status: anySynced ? 'Synced' : 'Sync Pending', destinations: summary },
      { status: anySynced ? 200 : 202 }
    );
  } catch (error: any) {
    console.error('Opportunity CRM Sync Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process CRM sync request.' }, { status: 500 });
  }
}
