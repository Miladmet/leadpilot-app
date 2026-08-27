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
    console.log(`Starting WebMCP crawling workflow for: ${url}`);
    const crawlData = await crawlWebsite(url);

    if (!crawlData.combinedContent || crawlData.combinedContent.length < 50) {
      return NextResponse.json(
        { error: 'Failed to crawl website content. Please verify the URL and try again.' },
        { status: 400 }
      );
    }

    // 3. Perform AI Analysis with Gemini
    console.log(`Running Gemini AI Sales Intelligence generation for: ${crawlData.companyName}`);
    const aiAnalysis = await analyzeCompany(crawlData.combinedContent, crawlData.companyName);

    // 4. Save to Database
    const prospect = await prisma.prospect.create({
      data: {
        userId: user.id,
        companyName: aiAnalysis.companyName,
        websiteUrl: crawlData.websiteUrl,
        summary: aiAnalysis.summary,
        painPoints: JSON.stringify(aiAnalysis.painPoints),
        opportunityScore: aiAnalysis.opportunityScore,
        buyingSignalScore: aiAnalysis.buyingSignalScore,
        coldEmail: aiAnalysis.coldEmail,
        linkedInMessage: aiAnalysis.linkedInMessage,
        salesAngle: aiAnalysis.salesAngle,
        cta: aiAnalysis.cta,
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
        details: `Analyzed company ${aiAnalysis.companyName} (${crawlData.websiteUrl})`,
      },
    });

    return NextResponse.json({ success: true, prospect });
  } catch (error: any) {
    console.error('Analyze API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error during analysis' },
      { status: 500 }
    );
  }
}
