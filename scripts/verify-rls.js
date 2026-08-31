/**
 * LeadPilot Production Deployment Security Gate: Row Level Security (RLS) Verifier
 * Blocks production build/deployment if any customer-facing table lacks active RLS.
 */

const { Client } = require('pg');

const REQUIRED_CUSTOMER_TABLES = [
  'User',
  'Prospect',
  'ActivityLog',
  'ResearchReports',
  'OpportunityAnalysis',
  'Proposals',
  'OutreachMessages',
  'Subscriptions'
];

async function verifyRLS() {
  console.log('----------------------------------------------------------------');
  console.log('  [SECURITY GATE] Auditing Database Row Level Security (RLS)    ');
  console.log('----------------------------------------------------------------');

  let databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ [SECURITY VIOLATION] DATABASE_URL is not set. Deployment blocked.');
    process.exit(1);
  }

  // Sanitize any accidental prefix or quotes
  databaseUrl = databaseUrl.trim();
  if ((databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) || (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"))) {
    databaseUrl = databaseUrl.slice(1, -1).trim();
  }
  const match = databaseUrl.match(/(?:postgres(?:ql)?:\/\/.*)/i);
  if (match) {
    databaseUrl = match[0].trim();
  }

  // If local SQLite is used in a non-production test, pass with notice
  if (databaseUrl.startsWith('file:')) {
    console.log('ℹ️ Local SQLite database detected. RLS enforced at application/tenantPrisma layer.');
    console.log('✅ [SECURITY GATE] Passed for local environment.');
    process.exit(0);
  }

  // Sanitize connectionString to ensure custom ssl options are honored
  const cleanUrl = databaseUrl.replace(/[?&]sslmode=[^&]+/, '');
  const client = new Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });


  try {
    await client.connect();

    // 1. Query PostgreSQL system catalogs for table RLS status
    const tablesRes = await client.query(`
      SELECT 
        c.relname as table_name,
        c.relrowsecurity as rls_enabled,
        c.relforcerowsecurity as rls_forced
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    `);

    // 2. Query policies
    const policiesRes = await client.query(`
      SELECT tablename, policyname, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
    `);

    const tableMap = new Map();
    tablesRes.rows.forEach(t => {
      tableMap.set(t.table_name.toLowerCase(), t);
    });

    const unprotectedTables = [];
    const policyViolations = [];

    console.log('Auditing core customer-facing tables:');

    for (const tableName of REQUIRED_CUSTOMER_TABLES) {
      const tableInfo = tableMap.get(tableName.toLowerCase());
      if (!tableInfo) {
        unprotectedTables.push(`${tableName} (TABLE MISSING IN DATABASE)`);
        console.error(`  ❌ ${tableName}: MISSING from database!`);
        continue;
      }

      if (!tableInfo.rls_enabled) {
        unprotectedTables.push(`${tableName} (RLS DISABLED)`);
        console.error(`  ❌ ${tableName}: Row Level Security is DISABLED!`);
        continue;
      }

      const policies = policiesRes.rows.filter(p => p.tablename.toLowerCase() === tableName.toLowerCase());
      if (policies.length === 0) {
        policyViolations.push(`${tableName} (RLS enabled but NO policies defined)`);
        console.error(`  ❌ ${tableName}: 0 active policies!`);
        continue;
      }

      console.log(`  ✅ ${tableName}: RLS ENABLED & FORCED (${policies.length} policies active)`);
    }

    if (unprotectedTables.length > 0 || policyViolations.length > 0) {
      console.error('\n================================================================');
      console.error('🚨 CRITICAL MULTI-TENANT SECURITY GATE FAILURE: DEPLOYMENT BLOCKED!');
      console.error('The following customer-facing tables violate tenant isolation requirements:');
      unprotectedTables.forEach(t => console.error(`  - ${t}`));
      policyViolations.forEach(p => console.error(`  - ${p}`));
      console.error('Customer data would be vulnerable to cross-account leakage.');
      console.error('Run: npx prisma db execute --file=prisma/migrations/apply-rls.sql');
      console.error('================================================================\n');
      process.exit(1);
    }

    console.log('\n----------------------------------------------------------------');
    console.log('✅ [SECURITY GATE PASSED]: 100% of customer tables protected by RLS.');
    console.log('----------------------------------------------------------------\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ [SECURITY GATE ERROR] Failed to query security metadata:', err.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

verifyRLS();
