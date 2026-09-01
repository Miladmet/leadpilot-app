import { NextRequest, NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/tenantPrisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { withTimeout, withRetry, TIMEOUT_LIMITS, crmQueue } from '@/lib/stability';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/** HubSpot Deals API v3 format */
function buildHubSpotPayload(prospect: any, recommendations: any[]) {
  return {
    properties: {
      dealname: `${prospect.companyName} — LeadPilot Opportunity`,
      website: prospect.websiteUrl,
      deal_source: 'LeadPilot Software',
      amount: '',
      opportunity_value_range: prospect.opportunityRange ?? '',
      evidence_quality_score: `${prospect.evidenceQuality ?? 0}%`,
      verification_pass_rate: `${prospect.verificationPassRate ?? 0}%`,
      reliability_score: `${prospect.findingReliability ?? 0}%`,
      executive_summary: prospect.executiveSummary ?? '',
      suggested_services: recommendations
        .map((r: any) => `${r.serviceName} (${r.estimatedFee})`)
        .join('; '),
      dealstage: 'appointmentscheduled',
      pipeline: 'default',
    },
  };
}

/** Generic Zapier / custom webhook format */
function buildZapierPayload(prospect: any, recommendations: any[]) {
  return {
    dealName: `${prospect.companyName} - LeadPilot Opportunity`,
    website: prospect.websiteUrl,
    source: 'LeadPilot Software',
    opportunityValueRange: prospect.opportunityRange ?? '',
    evidenceQualityScore: `${prospect.evidenceQuality ?? 0}%`,
    verificationPassRate: `${prospect.verificationPassRate ?? 0}%`,
    reliabilityScore: `${prospect.findingReliability ?? 0}%`,
    executiveSummary: prospect.executiveSummary ?? '',
    suggestedServices: recommendations.map((r: any) => ({
      service: r.serviceName,
      priority: r.priority || 'Strong',
      fee: r.estimatedFee,
      calcFormula: r.calculation,
    })),
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

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

    const prospect = await tenantDb.prospect.findUnique({ where: { id: prospectId } });
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found or unauthorized' }, { status: 404 });
    }

    let recommendationsList: any[] = [];
    try { recommendationsList = JSON.parse(prospect.recommendations) || []; } catch (e) {}

    // ------------------------------------------------------------------
    // Resolve destination URLs
    //   HUBSPOT_WEBHOOK_URL → HubSpot (HS Deals format)
    //   ZAPIER_WEBHOOK_URL  → Zapier / custom (generic format)
    //   crmWebhookUrl       → per-request override (treated as Zapier)
    //   Fallback            → local mock simulator
    // ------------------------------------------------------------------
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL?.trim() || '';
    const zapierUrl  = crmWebhookUrl?.trim() || process.env.ZAPIER_WEBHOOK_URL?.trim() || '';
    const fallback   = 'http://localhost:3000/api/crm/mock';

    const destinations: { url: string; payload: object; label: string }[] = [];

    if (hubspotUrl) destinations.push({ url: hubspotUrl, payload: buildHubSpotPayload(prospect, recommendationsList), label: 'HubSpot' });
    if (zapierUrl)  destinations.push({ url: zapierUrl,  payload: buildZapierPayload(prospect, recommendationsList),  label: 'Zapier'  });
    if (!destinations.length) destinations.push({ url: fallback, payload: buildZapierPayload(prospect, recommendationsList), label: 'MockCRM' });

    // Send to all destinations in parallel — per-destination fault isolation
    const results = await Promise.allSettled(
      destinations.map(({ url, payload, label }) =>
        sendWebhook(url, payload, label)
          .then(() => ({ label, status: 'synced', url }))
          .catch((err: Error) => {
            console.warn(`[CRM Fault Isolation] ${label} failed: ${err.message}. Queuing.`);
            const queued = crmQueue.enqueue({ prospectId: prospect.id, crmType: label, payload });
            return { label, status: 'queued', url, queueId: queued.id };
          })
      )
    );

    const summary = results.map(r => r.status === 'fulfilled' ? r.value : { label: '?', status: 'error' });
    const anySynced = summary.some(s => s.status === 'synced');

    await tenantDb.activityLog.create({
      data: {
        action: 'SYNCED_CRM',
        details: `CRM sync for ${prospect.companyName}: ${summary.map(s => `${s.label}→${s.status}`).join(', ')}`,
      },
    });

    return NextResponse.json(
      { success: true, status: anySynced ? 'Synced' : 'Sync Pending', destinations: summary },
      { status: anySynced ? 200 : 202 }
    );
  } catch (error: any) {
    console.error('CRM Sync Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process CRM sync request.' }, { status: 500 });
  }
}
