import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { crawlWebsite } from '@/lib/scraper';
import { analyzeCompany } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // 1. Fetch user & check limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Bypass check for AGENCY tier
    if (user.subscriptionTier !== 'AGENCY' && user.analysesUsed >= user.analysesLimit) {
      return NextResponse.json(
        { error: 'Monthly analysis limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // 2. Execute WebMCP crawler workflow
    console.log(`Starting WebMCP crawling workflow for client opportunities: ${url}`);
    const crawlData = await crawlWebsite(url);

    if (!crawlData.combinedContent || crawlData.combinedContent.length < 50) {
      return NextResponse.json(
        { error: 'Failed to crawl website content. Please verify the URL and try again.' },
        { status: 400 }
      );
    }

    // 3. Perform AI Analysis with Gemini (Client Acquisition Engine)
    console.log(`Running Gemini Client Acquisition Engine for: ${crawlData.companyName}`);
    const aiAnalysis = await analyzeCompany(crawlData.combinedContent, crawlData.companyName);

    // Create synthetic buying signals from high-confidence insights to populate schema
    const syntheticSignals = aiAnalysis.aiInferences
      .filter(i => i.confidence >= 70)
      .map(i => ({
        signal: i.finding,
        sourceUrl: aiAnalysis.verifiedFacts[0]?.sourceUrl || crawlData.websiteUrl,
        sourceText: i.evidence,
        dateDiscovered: new Date().toLocaleDateString()
      }));

    // 4. Save to Database with new client acquisition layout
    const prospect = await prisma.prospect.create({
      data: {
        userId: user.id,
        companyName: aiAnalysis.companyName,
        websiteUrl: crawlData.websiteUrl,
        
        // Serialized payloads
        verifiedFacts: JSON.stringify(aiAnalysis.verifiedFacts),
        aiInferences: JSON.stringify(aiAnalysis.aiInferences),
        buyingSignals: JSON.stringify(syntheticSignals),
        recommendations: JSON.stringify(aiAnalysis.recommendations),
        scoreExplanations: JSON.stringify(aiAnalysis.scoreExplanations),
        
        opportunityScore: aiAnalysis.opportunityScore,
        buyingSignalScore: aiAnalysis.buyingSignalScore,
        potentialRevenue: aiAnalysis.potentialRevenue,
        closingProbability: aiAnalysis.closingProbability,
        problemSeverity: aiAnalysis.problemSeverity,
        leadQuality: aiAnalysis.leadQuality,
        proposalStatus: 'Ready',

        executiveSummary: aiAnalysis.executiveSummary,
        expectedResults: aiAnalysis.expectedResults,
        estimatedRoi: aiAnalysis.estimatedRoi,
        thirtyDayPlan: aiAnalysis.thirtyDayPlan,
        ninetyDayPlan: aiAnalysis.ninetyDayPlan,
        pricingRecommendation: aiAnalysis.pricingRecommendation,

        coldEmail: aiAnalysis.coldEmail,
        linkedInMessage: aiAnalysis.linkedInMessage,
        discoveryScript: aiAnalysis.discoveryScript,
        followUpSequence: aiAnalysis.followUpSequence,
        meetingAgenda: aiAnalysis.meetingAgenda,
      },
    });

    // 5. Update user limits
    await prisma.user.update({
      where: { id: user.id },
      data: {
        analysesUsed: {
          increment: 1,
        },
      },
    });

    // 6. Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'ANALYZED_COMPANY',
        details: `Generated proposal for ${aiAnalysis.companyName} (Est. Revenue: $${aiAnalysis.potentialRevenue})`,
      },
    });

    return NextResponse.json({ success: true, prospect });
  } catch (error: any) {
    console.error('Analyze API Error:', error);
    return NextResponse.json(
      { error: 'Opportunity analysis failed. The website may have strong scraping protections (e.g. Cloudflare, Akamai) or rate limits.' },
      { status: 500 }
    );
  }
}
