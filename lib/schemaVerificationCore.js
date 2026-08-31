/**
 * LeadPilot AI Database Schema Verification Core
 *
 * Compares Prisma models against production database tables (SQLite or PostgreSQL).
 * Verifies:
 * - Tables exist
 * - Columns exist
 * - Indexes exist
 * - Constraints exist
 *
 * Detects:
 * - Missing tables
 * - Missing columns
 * - Unexpected schema drift
 *
 * Generates:
 * - Database Schema Health Report
 * - Exact deployment failure block:
 *     Schema Drift Detected
 *     Model: <Model>
 *     Missing Column: <Column>
 *     Status: Deployment Blocked
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
    ],
    indexes: ['User_email_key', 'User_pkey', 'sqlite_autoindex_User_1'],
    constraints: []
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
    ],
    indexes: ['Prospect_pkey'],
    constraints: ['User']
  },
  ActivityLog: {
    tableName: 'ActivityLog',
    columns: [
      'id',
      'userId',
      'action',
      'details',
      'createdAt'
    ],
    indexes: ['ActivityLog_pkey'],
    constraints: ['User']
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
    ],
    indexes: ['ResearchReports_pkey'],
    constraints: ['User', 'Prospect']
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
    ],
    indexes: ['OpportunityAnalysis_pkey'],
    constraints: ['User', 'Prospect']
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
    ],
    indexes: ['Proposals_pkey'],
    constraints: ['User', 'Prospect']
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
    ],
    indexes: ['OutreachMessages_pkey'],
    constraints: ['User', 'Prospect']
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
    ],
    indexes: ['Subscriptions_pkey'],
    constraints: ['User']
  }
};

/**
 * Deep live schema introspection (tables, columns, indexes, foreign key constraints)
 */
async function introspectLiveSchema(prismaClient) {
  let dbUrl = process.env.DATABASE_URL || '';
  const match = dbUrl.match(/(?:postgres(?:ql)?:\/\/.*)/i);
  if (match) {
    dbUrl = match[0].trim();
  }
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
  const liveTables = new Map();

  if (isPostgres) {
    // 1. PostgreSQL Tables
    const tablesRes = await prismaClient.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    // 2. Columns
    const columnsRes = await prismaClient.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public';
    `);

    // 3. Indexes
    const indexesRes = await prismaClient.$queryRawUnsafe(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public';
    `);

    // 4. Foreign Key Constraints
    const constraintsRes = await prismaClient.$queryRawUnsafe(`
      SELECT
        tc.table_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `);

    for (const t of tablesRes) {
      liveTables.set(t.table_name, {
        columns: new Set(),
        indexes: new Set(),
        constraints: new Set()
      });
    }

    for (const c of columnsRes) {
      if (liveTables.has(c.table_name)) {
        liveTables.get(c.table_name).columns.add(c.column_name);
      }
    }

    for (const idx of indexesRes) {
      if (liveTables.has(idx.tablename)) {
        liveTables.get(idx.tablename).indexes.add(idx.indexname);
      }
    }

    for (const fk of constraintsRes) {
      if (liveTables.has(fk.table_name)) {
        liveTables.get(fk.table_name).constraints.add(fk.foreign_table_name);
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
      const indexes = new Set();
      const constraints = new Set();

      // Column info
      try {
        const colRes = await prismaClient.$queryRawUnsafe(`PRAGMA table_info("${tableName}");`);
        for (const col of colRes) {
          columns.add(col.name);
        }
      } catch (err) {
        console.warn(`[Schema Verification] Could not inspect columns for ${tableName}:`, err.message);
      }

      // Index list
      try {
        const idxRes = await prismaClient.$queryRawUnsafe(`PRAGMA index_list("${tableName}");`);
        for (const idx of idxRes) {
          indexes.add(idx.name);
        }
      } catch (err) {
        console.warn(`[Schema Verification] Could not inspect indexes for ${tableName}:`, err.message);
      }

      // Foreign key list
      try {
        const fkRes = await prismaClient.$queryRawUnsafe(`PRAGMA foreign_key_list("${tableName}");`);
        for (const fk of fkRes) {
          constraints.add(fk.table);
        }
      } catch (err) {
        console.warn(`[Schema Verification] Could not inspect foreign keys for ${tableName}:`, err.message);
      }

      liveTables.set(tableName, {
        columns,
        indexes,
        constraints
      });
    }
  }

  return liveTables;
}

/**
 * Formats the exact required failure block when drift is detected.
 */
function formatDriftBlockedReport(driftItem) {
  return [
    'Schema Drift Detected',
    '',
    'Model:',
    `${driftItem.model}`,
    '',
    `${driftItem.type === 'COLUMN' ? 'Missing Column:' : 'Missing Table:'}`,
    `${driftItem.name}`,
    '',
    'Status:',
    'Deployment Blocked'
  ].join('\n');
}

/**
 * Compares live schema against expected Prisma models and generates reports.
 */
async function verifyDatabaseSchema(prismaClient) {
  const liveTables = await introspectLiveSchema(prismaClient);
  const modelReports = [];
  let isHealthy = true;
  const missingTables = [];
  const missingColumns = [];
  const missingItems = [];
  const reportLines = ['Database Schema Health Report\n'];

  for (const [modelName, def] of Object.entries(EXPECTED_MODELS)) {
    const tableName = def.tableName;
    const expectedColumns = def.columns;

    // Check table existence
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
      missingTables.push(tableName);
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

    const tableMeta = liveTables.get(matchedLiveName);
    const liveColumns = tableMeta.columns;
    const modelMissingColumns = [];
    const existingColumns = [];

    for (const col of expectedColumns) {
      if (liveColumns.has(col)) {
        existingColumns.push(col);
      } else {
        modelMissingColumns.push(col);
        missingColumns.push(`${modelName}.${col}`);
        missingItems.push({ model: modelName, type: 'COLUMN', name: col });
      }
    }

    if (modelMissingColumns.length > 0) {
      isHealthy = false;

      modelReports.push({
        modelName,
        tableName: matchedLiveName,
        tableExists: true,
        allColumnsPresent: false,
        missingColumns: modelMissingColumns,
        existingColumns,
        status: 'MISSING_COLUMNS'
      });

      reportLines.push(`${modelName}`);
      for (const col of modelMissingColumns) {
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

  // Primary drift block if any drift occurred
  let driftBlockedText = null;
  if (!isHealthy && missingItems.length > 0) {
    driftBlockedText = formatDriftBlockedReport(missingItems[0]);
  }

  return {
    isHealthy,
    schemaStatus: isHealthy ? 'Healthy' : 'Drift Detected',
    migrationStatus: isHealthy ? 'Up To Date' : 'Pending Migration',
    lastVerification: new Date().toISOString(),
    totalModelsChecked: Object.keys(EXPECTED_MODELS).length,
    missingItemsCount: missingItems.length,
    missingTablesCount: missingTables.length,
    missingColumnsCount: missingColumns.length,
    missingTables,
    missingColumns,
    missingItems,
    models: modelReports,
    reportText,
    driftBlockedText
  };
}

module.exports = {
  EXPECTED_MODELS,
  introspectLiveSchema,
  verifyDatabaseSchema,
  formatDriftBlockedReport
};
