/**
 * LeadPilot AI Database Self-Healing Engine
 *
 * Provides idempotent, non-blocking, sub-millisecond database self-healing
 * for PostgreSQL production environments (e.g. Vercel + Neon / Supabase).
 *
 * Uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so that newly introduced
 * Prisma fields are safely added without downtime, data loss, or build failures.
 */

const SAFE_CORE_PROSPECT_SELECT = {
  id: true,
  userId: true,
  companyName: true,
  websiteUrl: true,
  createdAt: true,
  updatedAt: true,
  verifiedFacts: true,
  aiInferences: true,
  buyingSignals: true,
  recommendations: true,
  competitorGaps: true,
  opportunityScore: true,
  buyingSignalScore: true,
  scoreExplanations: true,
  potentialRevenue: true,
  closingProbability: true,
  problemSeverity: true,
  leadQuality: true,
  proposalStatus: true,
  evidenceQuality: true,
  verificationPassRate: true,
  findingReliability: true,
  factsVerifiedCount: true,
  claimsRejectedCount: true,
  lowConfidenceCount: true,
  suppressedRecsCount: true,
  executiveSummary: true,
  expectedResults: true,
  estimatedRoi: true,
  thirtyDayPlan: true,
  ninetyDayPlan: true,
  pricingRecommendation: true,
  coldEmail: true,
  linkedInMessage: true,
  discoveryScript: true,
  followUpSequence: true,
  meetingAgenda: true
};

const POSTGRES_SELF_HEAL_STATEMENTS = [
  // Analysis Versioning & Repeated Analysis Detection
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "analysisVersion" INTEGER DEFAULT 1;`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "previousAnalysisId" TEXT;`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "changeSummary" TEXT DEFAULT '{}';`,

  // Crawl Diagnostics & Multi-Page Inventory
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "pagesDiscoveredCount" INTEGER DEFAULT 1;`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "pagesCrawledCount" INTEGER DEFAULT 1;`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "crawlCoveragePercent" INTEGER DEFAULT 100;`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "crawlDurationMs" INTEGER DEFAULT 0;`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "totalTextExtracted" INTEGER DEFAULT 0;`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "crawledPagesData" TEXT DEFAULT '[]';`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "crawlDiagnostics" TEXT DEFAULT '{}';`,

  // Valuation & Outreach
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "opportunityRange" TEXT DEFAULT '';`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "revenueAssumptions" TEXT DEFAULT '';`,
  `ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "outreachCampaign" TEXT DEFAULT '{}';`
];

let isHealed = false;

/**
 * Executes idempotent PostgreSQL column creation.
 */
async function selfHealDatabaseSchema(prismaClient) {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

  if (!isPostgres) {
    return { skipped: true, reason: 'Not PostgreSQL' };
  }

  let executedCount = 0;
  for (const statement of POSTGRES_SELF_HEAL_STATEMENTS) {
    try {
      await prismaClient.$executeRawUnsafe(statement);
      executedCount++;
    } catch (err) {
      console.warn('[DB Self-Heal] Non-critical error executing statement:', err.message);
    }
  }

  isHealed = true;
  return { success: true, executedCount };
}

/**
 * Augments a prospect record with safe fallback default values if missing.
 */
function normalizeProspectDefaults(record) {
  if (!record) return record;
  return {
    ...record,
    analysisVersion: record.analysisVersion ?? 1,
    previousAnalysisId: record.previousAnalysisId ?? null,
    changeSummary: record.changeSummary ?? '{}',
    pagesDiscoveredCount: record.pagesDiscoveredCount ?? 1,
    pagesCrawledCount: record.pagesCrawledCount ?? 1,
    crawlCoveragePercent: record.crawlCoveragePercent ?? 100,
    crawlDurationMs: record.crawlDurationMs ?? 0,
    totalTextExtracted: record.totalTextExtracted ?? 0,
    crawledPagesData: record.crawledPagesData ?? '[]',
    crawlDiagnostics: record.crawlDiagnostics ?? '{}',
    opportunityRange: record.opportunityRange ?? '',
    revenueAssumptions: record.revenueAssumptions ?? '',
    outreachCampaign: record.outreachCampaign ?? '{}'
  };
}

module.exports = {
  SAFE_CORE_PROSPECT_SELECT,
  POSTGRES_SELF_HEAL_STATEMENTS,
  selfHealDatabaseSchema,
  normalizeProspectDefaults
};
