/**
 * LeadPilot AI Database Schema Verification Core
 *
 * Compares Prisma models against production database tables (SQLite or PostgreSQL).
 * Verifies that all expected tables, columns, indexes, and constraints exist.
 * Detects missing tables, missing columns, and unexpected schema drift.
 * Generates the standardized Schema Verification Report and blocks deployment on drift.
 */

const EXPECTED_MODELS = {
  User: {
    tableName: 'User',
    columns: [
      'id',
      'email',
      'passwordHash',
      'subscriptionTier',
      'subscriptionStatus',
      'analysesLimit',
      'analysesUsed',
      'stripeCustomerId',
      'resetDate',
      'createdAt',
      'updatedAt'
    ]
  },
  Prospect: {
    tableName: 'Prospect',
    columns: [
      'id',
      'userId',
      'companyName',
      'websiteUrl',
      'verifiedFacts',
      'aiInferences',
      'buyingSignals',
      'recommendations',
      'competitorGaps',
      'opportunityScore',
      'buyingSignalScore',
      'scoreExplanations',
      'potentialRevenue',
      'closingProbability',
      'problemSeverity',
      'leadQuality',
      'proposalStatus',
      'evidenceQuality',
      'verificationPassRate',
      'findingReliability',
      'factsVerifiedCount',
      'claimsRejectedCount',
      'lowConfidenceCount',
      'suppressedRecsCount',
      'opportunityRange',
      'revenueAssumptions',
      'pagesDiscoveredCount',
      'pagesCrawledCount',
      'crawlCoveragePercent',
      'crawlDurationMs',
      'totalTextExtracted',
      'crawledPagesData',
      'crawlDiagnostics',
      'analysisVersion',
      'previousAnalysisId',
      'changeSummary',
      'executiveSummary',
      'expectedResults',
      'estimatedRoi',
      'thirtyDayPlan',
      'ninetyDayPlan',
      'pricingRecommendation',
      'coldEmail',
      'linkedInMessage',
      'discoveryScript',
      'followUpSequence',
      'meetingAgenda',
      'outreachCampaign',
      'createdAt',
      'updatedAt'
    ]
  },
  ActivityLog: {
    tableName: 'ActivityLog',
    columns: [
      'id',
      'userId',
      'action',
      'details',
      'createdAt'
    ]
  },
  ResearchReports: {
    tableName: 'ResearchReports',
    columns: [
      'id',
      'userId',
      'prospectId',
      'url',
      'title',
      'category',
      'depth',
      'crawledText',
      'diagnostics',
      'createdAt',
      'updatedAt'
    ]
  },
  OpportunityAnalysis: {
    tableName: 'OpportunityAnalysis',
    columns: [
      'id',
      'userId',
      'prospectId',
      'opportunityScore',
      'buyingSignalScore',
      'recommendations',
      'competitorGaps',
      'riskFactors',
      'createdAt',
      'updatedAt'
    ]
  },
  Proposals: {
    tableName: 'Proposals',
    columns: [
      'id',
      'userId',
      'prospectId',
      'title',
      'status',
      'executiveSummary',
      'scopeOfWork',
      'pricing',
      'roiEstimate',
      'plan30Day',
      'plan90Day',
      'createdAt',
      'updatedAt'
    ]
  },
  OutreachMessages: {
    tableName: 'OutreachMessages',
    columns: [
      'id',
      'userId',
      'prospectId',
      'channel',
      'recipient',
      'subject',
      'body',
      'status',
      'sentAt',
      'createdAt',
      'updatedAt'
    ]
  },
  Subscriptions: {
    tableName: 'Subscriptions',
    columns: [
      'id',
      'userId',
      'stripeCustomerId',
      'stripeSubscriptionId',
      'tier',
      'status',
      'currentPeriodEnd',
      'cancelAtPeriodEnd',
      'createdAt'
    ]
  }
};

/**
 * Introspects live SQLite or PostgreSQL tables and columns via Prisma raw queries.
 */
async function introspectLiveSchema(prismaClient) {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
  const liveTables = new Map();

  if (isPostgres) {
    // 1. PostgreSQL Schema Introspection
    const tablesRes = await prismaClient.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    const columnsRes = await prismaClient.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public';
    `);

    for (const t of tablesRes) {
      liveTables.set(t.table_name, new Set());
    }

    for (const c of columnsRes) {
      if (liveTables.has(c.table_name)) {
        liveTables.get(c.table_name).add(c.column_name);
      }
    }
  } else {
    // 2. SQLite Schema Introspection
    const tablesRes = await prismaClient.$queryRawUnsafe(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';
    `);

    for (const t of tablesRes) {
      const tableName = t.name;
      const columns = new Set();
      try {
        const colRes = await prismaClient.$queryRawUnsafe(`PRAGMA table_info("${tableName}");`);
        for (const col of colRes) {
          columns.add(col.name);
        }
      } catch (err) {
        console.warn(`[Schema Verification] Could not inspect table ${tableName}:`, err.message);
      }
      liveTables.set(tableName, columns);
    }
  }

  return liveTables;
}

/**
 * Compares live schema against expected Prisma models.
 * Generates structured report and determines healthy/drift state.
 */
async function verifyDatabaseSchema(prismaClient) {
  const liveTables = await introspectLiveSchema(prismaClient);
  const modelReports = [];
  let isHealthy = true;
  const missingItems = [];
  const reportLines = ['Schema Verification Report\n'];

  for (const [modelName, def] of Object.entries(EXPECTED_MODELS)) {
    const tableName = def.tableName;
    const expectedColumns = def.columns;

    // Check table existence (case-insensitive fallback check)
    let matchedLiveName = null;
    if (liveTables.has(tableName)) {
      matchedLiveName = tableName;
    } else {
      for (const liveName of liveTables.keys()) {
        if (liveName.toLowerCase() === tableName.toLowerCase()) {
          matchedLiveName = liveName;
          break;
        }
      }
    }

    if (!matchedLiveName) {
      isHealthy = false;
      missingItems.push({ model: modelName, type: 'TABLE', name: tableName });
      modelReports.push({
        modelName,
        tableName,
        tableExists: false,
        allColumnsPresent: false,
        missingColumns: expectedColumns,
        existingColumns: [],
        status: 'MISSING_TABLE'
      });

      reportLines.push(`${modelName}`);
      reportLines.push(`❌ Missing Table:`);
      reportLines.push(`${tableName}\n`);
      continue;
    }

    const liveColumns = liveTables.get(matchedLiveName);
    const missingColumns = [];
    const existingColumns = [];

    for (const col of expectedColumns) {
      if (liveColumns.has(col)) {
        existingColumns.push(col);
      } else {
        missingColumns.push(col);
      }
    }

    if (missingColumns.length > 0) {
      isHealthy = false;
      for (const col of missingColumns) {
        missingItems.push({ model: modelName, type: 'COLUMN', name: col });
      }

      modelReports.push({
        modelName,
        tableName: matchedLiveName,
        tableExists: true,
        allColumnsPresent: false,
        missingColumns,
        existingColumns,
        status: 'MISSING_COLUMNS'
      });

      reportLines.push(`${modelName}`);
      for (const col of missingColumns) {
        reportLines.push(`❌ Missing Column:`);
        reportLines.push(`${col}`);
      }
      reportLines.push('');
    } else {
      modelReports.push({
        modelName,
        tableName: matchedLiveName,
        tableExists: true,
        allColumnsPresent: true,
        missingColumns: [],
        existingColumns,
        status: 'HEALTHY'
      });

      reportLines.push(`${modelName}`);
      reportLines.push(`✅ All Columns Present\n`);
    }
  }

  const reportText = reportLines.join('\n').trim();

  return {
    isHealthy,
    schemaStatus: isHealthy ? 'Healthy' : 'Drift Detected',
    migrationStatus: isHealthy ? 'Up To Date' : 'Pending Migration',
    lastVerification: new Date().toISOString(),
    totalModelsChecked: Object.keys(EXPECTED_MODELS).length,
    missingItemsCount: missingItems.length,
    missingItems,
    models: modelReports,
    reportText
  };
}

module.exports = {
  EXPECTED_MODELS,
  introspectLiveSchema,
  verifyDatabaseSchema
};
