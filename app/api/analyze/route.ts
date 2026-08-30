import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { crawlWebsite } from '@/lib/scraper';
import { analyzeCompany } from '@/lib/gemini';
import { withTimeout, withRetry, TIMEOUT_LIMITS } from '@/lib/stability';
import { normalizeWebsiteUrl, detectAnalysisChanges } from '@/lib/changeDetection';
import { classifyAnalysisError } from '@/lib/analysisErrors';


function pruneHtmlContent(content: string): string {
  if (!content) return '';
  // Preserve <website>, </website>, <page...>, </page> XML structure while cleaning any residual tags
  let pruned = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  return pruned.trim();
}

function sanitizeInt(val: any, fallback: number = 0): number {
  if (typeof val === 'number' && !isNaN(val)) return Math.round(val);
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

function sanitizeString(val: any, fallback: string = ''): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map((item: any) => typeof item === 'string' ? item : JSON.stringify(item)).join('\n');
  }
  if (val && typeof val === 'object') {
    return JSON.stringify(val);
  }
  return fallback;
}

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

    if (user.subscriptionTier !== 'AGENCY' && user.analysesUsed >= user.analysesLimit) {
      return NextResponse.json(
        { error: 'Monthly analysis limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // 2. Execute WebMCP crawler with 30s timeout and 3-attempt exponential backoff
    console.log(`Starting WebMCP crawling workflow for client opportunities: ${url}`);
    let crawlData;
    try {
      crawlData = await withTimeout(
        withRetry(
          () => crawlWebsite(url),
          { maxRetries: 3, backoffMs: 300, operationName: 'Crawl Engine' }
        ),
        TIMEOUT_LIMITS.CRAWL_MS,
        'Crawl Engine'
      );
    } catch (crawlErr: any) {
      // CRAWL SAFETY: Do not continue opportunity generation. Record diagnostic information.
      console.error('[Crawl Safety] Crawl failed or timed out:', crawlErr);
      const isTimeout = crawlErr.code === 'ETIMEDOUT' || crawlErr.message?.includes('timed out');
      const is403 = crawlErr.message?.includes('403');
      const is404 = crawlErr.message?.includes('404');
      const reason = isTimeout ? 'Operation timed out.' : is403 ? '403 Forbidden' : is404 ? '404 Not Found' : 'Blocked or unreachable';

      return NextResponse.json(
        {
          error: 'Website Crawl Failed',
          status: 'Website Crawl Failed',
          reason,
          diagnostics: {
            url,
            attemptedAt: new Date().toISOString(),
            failureType: isTimeout ? 'Timeout' : 'Network/HTTP Error',
            details: crawlErr.message || 'Target host blocked or failed crawl requests.'
          }
        },
        { status: 422 }
      );
    }

    if (!crawlData.combinedContent || crawlData.combinedContent.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Website Crawl Failed',
          status: 'Website Crawl Failed',
          reason: 'Empty Content Extracted',
          diagnostics: { url, failureType: 'Content Extraction Failure' }
        },
        { status: 422 }
      );
    }

    // 3. Perform AI Analysis with Gemini (60s timeout, 2 retries)
    console.log(`Running Gemini Verification Pipeline for: ${crawlData.companyName}`);
    const prunedContent = pruneHtmlContent(crawlData.combinedContent);
    let aiAnalysis;
    try {
      aiAnalysis = await withTimeout(
        withRetry(
          () => analyzeCompany(prunedContent, crawlData.companyName),
          { maxRetries: 2, backoffMs: 500, operationName: 'AI Analysis' }
        ),
        TIMEOUT_LIMITS.AI_ANALYSIS_MS,
        'AI Analysis'
      );
    } catch (aiErr: any) {
      console.error('[AI Analysis Safety] AI pipeline failed or timed out:', aiErr);
      return NextResponse.json(
        {
          error: aiErr.code === 'ETIMEDOUT' ? 'Operation timed out.' : 'AI Analysis temporarily unavailable.',
          reason: aiErr.message || 'AI provider outage or timeout.',
          diagnostics: { company: crawlData.companyName, failureType: 'AI_PROVIDER_ERROR' }
        },
        { status: 504 }
      );
    }


    // Create synthetic buying signals from high-confidence insights to populate schema
    const syntheticSignals = aiAnalysis.aiInferences
      .filter(i => i.confidence >= 70 && i.status !== 'Suppressed')
      .map(i => ({
        signal: i.finding,
        sourceUrl: aiAnalysis.verifiedFacts[0]?.sourceUrl || crawlData.websiteUrl,
        sourceText: i.evidence,
        dateDiscovered: new Date().toLocaleDateString()
      }));

    // 4. Repeated Analysis Detection & Version History
    const cleanCurrentUrl = normalizeWebsiteUrl(crawlData.websiteUrl);
    const existingProspects = await prisma.prospect.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const previousProspects = existingProspects.filter(p => normalizeWebsiteUrl(p.websiteUrl) === cleanCurrentUrl);
    const versionNumber = previousProspects.length + 1;
    const previousProspect = previousProspects.length > 0 ? previousProspects[0] : null;

    let changeSummaryPayload: any = {};
    if (previousProspect) {
      const currentDraft = {
        id: 'current-draft',
        createdAt: new Date().toISOString(),
        verifiedFacts: JSON.stringify(aiAnalysis.verifiedFacts),
        recommendations: JSON.stringify(aiAnalysis.recommendations),
        opportunityRange: aiAnalysis.opportunityRange,
        revenueAssumptions: aiAnalysis.revenueAssumptions,
        pagesCrawledCount: crawlData.diagnostics.pagesCrawled,
        crawlCoveragePercent: crawlData.diagnostics.coveragePercentage,
        totalTextExtracted: crawlData.diagnostics.totalTextExtracted,
        crawledPagesData: JSON.stringify(crawlData.discoveredPages),
        evidenceQuality: aiAnalysis.evidenceQuality,
        verificationPassRate: aiAnalysis.verificationPassRate,
        findingReliability: aiAnalysis.findingReliability
      };

      changeSummaryPayload = detectAnalysisChanges(currentDraft, previousProspect, {
        version: versionNumber,
        totalVersions: versionNumber
      });
    }

    // 5. Save to Database with new client acquisition layout
    const prospect = await prisma.prospect.create({
      data: {
        userId: user.id,
        companyName: sanitizeString(aiAnalysis.companyName, 'Target Company'),
        websiteUrl: crawlData.websiteUrl,
        
        // Serialized payloads
        verifiedFacts: JSON.stringify(Array.isArray(aiAnalysis.verifiedFacts) ? aiAnalysis.verifiedFacts : []),
        aiInferences: JSON.stringify(Array.isArray(aiAnalysis.aiInferences) ? aiAnalysis.aiInferences : []),
        buyingSignals: JSON.stringify(syntheticSignals),
        recommendations: JSON.stringify(Array.isArray(aiAnalysis.recommendations) ? aiAnalysis.recommendations : []),
        competitorGaps: JSON.stringify(Array.isArray(aiAnalysis.competitorGaps) ? aiAnalysis.competitorGaps : []),
        scoreExplanations: JSON.stringify(aiAnalysis.scoreExplanations || {}),

        opportunityScore: sanitizeInt(aiAnalysis.opportunityScore, 50),
        buyingSignalScore: sanitizeInt(aiAnalysis.buyingSignalScore, 50),
        potentialRevenue: sanitizeInt(aiAnalysis.potentialRevenue, 15000),
        closingProbability: sanitizeInt(aiAnalysis.closingProbability, 50),
        problemSeverity: sanitizeString(aiAnalysis.problemSeverity, 'Medium'),
        leadQuality: sanitizeString(aiAnalysis.leadQuality, 'Warm'),
        proposalStatus: sanitizeString(aiAnalysis.proposalStatus, 'Ready'),

        // NEW: Trust Metrics
        evidenceQuality: sanitizeInt(aiAnalysis.evidenceQuality, 90),
        verificationPassRate: sanitizeInt(aiAnalysis.verificationPassRate, 95),
        findingReliability: sanitizeInt(aiAnalysis.findingReliability, 92),
        factsVerifiedCount: sanitizeInt(aiAnalysis.factsVerifiedCount, 0),
        claimsRejectedCount: sanitizeInt(aiAnalysis.claimsRejectedCount, 0),
        lowConfidenceCount: sanitizeInt(aiAnalysis.lowConfidenceCount, 0),
        suppressedRecsCount: sanitizeInt(aiAnalysis.suppressedRecsCount, 0),
        opportunityRange: sanitizeString(aiAnalysis.opportunityRange, '$10,000 - $25,000'),
        revenueAssumptions: typeof aiAnalysis.revenueAssumptions === 'string'
          ? aiAnalysis.revenueAssumptions
          : JSON.stringify(aiAnalysis.revenueAssumptions || {}),

        // NEW: Crawl Coverage & Diagnostics Metrics
        pagesDiscoveredCount: sanitizeInt(crawlData.diagnostics.pagesDiscovered, 1),
        pagesCrawledCount: sanitizeInt(crawlData.diagnostics.pagesCrawled, 1),
        crawlCoveragePercent: sanitizeInt(crawlData.diagnostics.coveragePercentage, 100),
        crawlDurationMs: sanitizeInt(crawlData.diagnostics.crawlDurationMs, 0),
        totalTextExtracted: sanitizeInt(crawlData.diagnostics.totalTextExtracted, 0),
        crawledPagesData: JSON.stringify(crawlData.discoveredPages || []),
        crawlDiagnostics: JSON.stringify(crawlData.diagnostics || {}),

        // NEW: Versioning & Change Detection
        analysisVersion: sanitizeInt(versionNumber, 1),
        previousAnalysisId: previousProspect ? previousProspect.id : null,
        changeSummary: JSON.stringify(changeSummaryPayload || {}),

        executiveSummary: sanitizeString(aiAnalysis.executiveSummary),
        expectedResults: sanitizeString(aiAnalysis.expectedResults),
        estimatedRoi: sanitizeString(aiAnalysis.estimatedRoi),
        thirtyDayPlan: sanitizeString(aiAnalysis.thirtyDayPlan),
        ninetyDayPlan: sanitizeString(aiAnalysis.ninetyDayPlan),
        pricingRecommendation: sanitizeString(aiAnalysis.pricingRecommendation),

        coldEmail: sanitizeString(aiAnalysis.coldEmail),
        linkedInMessage: sanitizeString(aiAnalysis.linkedInMessage),
        discoveryScript: sanitizeString(aiAnalysis.discoveryScript),
        followUpSequence: sanitizeString(aiAnalysis.followUpSequence),
        meetingAgenda: sanitizeString(aiAnalysis.meetingAgenda),
      },
    });


    // 4b. Create relational customer records for multi-tenant protection
    try {
      await Promise.all([
        prisma.researchReports.create({
          data: {
            userId: user.id,
            prospectId: prospect.id,
            url: crawlData.websiteUrl,
            title: aiAnalysis.companyName,
            category: 'Audit Research',
            depth: 2,
            crawledText: pruneHtmlContent(crawlData.combinedContent).slice(0, 5000),
            diagnostics: JSON.stringify(crawlData.diagnostics),
          },
        }),
        prisma.opportunityAnalysis.create({
          data: {
            userId: user.id,
            prospectId: prospect.id,
            opportunityScore: aiAnalysis.opportunityScore,
            buyingSignalScore: aiAnalysis.buyingSignalScore,
            recommendations: JSON.stringify(aiAnalysis.recommendations),
            competitorGaps: JSON.stringify(aiAnalysis.competitorGaps),
          },
        }),
        prisma.proposals.create({
          data: {
            userId: user.id,
            prospectId: prospect.id,
            title: `Growth & Optimization Proposal for ${aiAnalysis.companyName}`,
            status: aiAnalysis.proposalStatus,
            executiveSummary: aiAnalysis.executiveSummary,
            scopeOfWork: JSON.stringify(aiAnalysis.recommendations),
            pricing: aiAnalysis.pricingRecommendation,
            roiEstimate: aiAnalysis.estimatedRoi,
            plan30Day: aiAnalysis.thirtyDayPlan,
            plan90Day: aiAnalysis.ninetyDayPlan,
          },
        }),
        prisma.outreachMessages.create({
          data: {
            userId: user.id,
            prospectId: prospect.id,
            channel: 'Email',
            recipient: `contact@${crawlData.websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}`,
            subject: `Growth Strategy Audit for ${aiAnalysis.companyName}`,
            body: aiAnalysis.coldEmail,
            status: 'Draft',
          },
        }),
      ]);
    } catch (relError) {
      console.warn('Failed to insert auxiliary tenant records (non-blocking):', relError);
    }

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
        details: `Analyzed ${aiAnalysis.companyName} (${crawlData.diagnostics.pagesCrawled}/${crawlData.diagnostics.pagesDiscovered} pages, Pass Rate: ${aiAnalysis.verificationPassRate}%)`,
      },
    });



    return NextResponse.json({ success: true, prospect, changeReport: changeSummaryPayload });

  } catch (error: any) {
    console.error('Analyze API Error:', error);
    const classified = classifyAnalysisError(error);

    return NextResponse.json(
      {
        error: classified.userMessage,
        classification: classified.classification,
        referenceCode: classified.referenceCode,
        isRetryable: classified.isRetryable,
        adminDetails: classified.adminDetails,
        diagnostics: { failureType: classified.classification, details: error?.message || '' }
      },
      { status: classified.httpStatus }
    );
  }
}
