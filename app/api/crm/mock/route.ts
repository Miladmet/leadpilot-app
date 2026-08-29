import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[CRM Simulator Webhook] Received Deal Payload:', {
      dealName: body.dealName,
      website: body.website,
      opportunityValueRange: body.opportunityValueRange,
      evidenceQualityScore: body.evidenceQualityScore,
      servicesCount: body.suggestedServices?.length || 0,
      timestamp: body.timestamp,
    });

    return NextResponse.json({
      success: true,
      message: 'Deal received successfully by LeadPilot CRM Simulator',
      receivedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
