const { execSync } = require('child_process');

// Detect if we are running in Vercel or a production environment
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const schemaPath = isProduction ? 'prisma/schema.prod.prisma' : 'prisma/schema.prisma';

// Ensure DIRECT_URL fallback exists so Prisma doesn't error if DIRECT_URL is unset on Vercel
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

console.log(`[Build Setup] Detected production=${isProduction}. Using schema: ${schemaPath}`);

try {
  // Generate Prisma Client for the active provider
  execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });

  // In production, sync database schema to prevent missing column drift
  if (isProduction && process.env.DATABASE_URL) {
    console.log('[Build Step] Synchronizing production database schema (prisma db push)...');
    try {
      execSync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, { stdio: 'inherit' });
    } catch (pushErr) {
      console.warn('[Build Step] prisma db push encountered non-fatal notice:', pushErr.message);
    }
  }

  // In production, execute the Database RLS Security Gate
  if (isProduction && process.env.DATABASE_URL) {
    console.log('[Build Gate] Enforcing Multi-Tenant Row Level Security (RLS) check...');
    execSync('node scripts/verify-rls.js', { stdio: 'inherit' });
  }

  // Execute the Storage Security Gate to block deployment if customer buckets lack isolation
  console.log('[Build Gate] Enforcing Storage Security Gate audit & penetration checks...');
  execSync('node scripts/verify-storage-security.js', { stdio: 'inherit' });

  // Execute the Platform Trust Gate (Resilience, Degradation & Safety)
  console.log('[Build Gate] Enforcing Platform Trust Gate (Resilience, Degradation & Safety)...');
  execSync('node scripts/test-trust-engine.js', { stdio: 'inherit' });

  // Execute the Opportunity Calculation Gate (Valuation, Confidence & Safety)
  console.log('[Build Gate] Enforcing Opportunity Calculation Engine Gate...');
  execSync('node scripts/test-opportunity-engine.js', { stdio: 'inherit' });

  // Execute the Solution Sandbox Gate (Safety, Evidence & Concept Models)
  console.log('[Build Gate] Enforcing Solution Sandbox Safety & Model Gate...');
  execSync('node scripts/test-sandbox-engine.js', { stdio: 'inherit' });

  // Execute the Production Stability Framework Gate (Fault Isolation, Timeouts & Retries)
  console.log('[Build Gate] Enforcing Production Stability Framework Gate...');
  execSync('node scripts/test-stability-framework.js', { stdio: 'inherit' });

  // Execute the Analysis Change Detection & Explanation Gate
  console.log('[Build Gate] Enforcing Analysis Change Detection & Explanation Engine Gate...');
  execSync('node scripts/test-change-detection.js', { stdio: 'inherit' });

  // Execute the Traffic Growth Engine Gate (SEO Keywords, Free Tools, Social, Referrals & Audits)
  console.log('[Build Gate] Enforcing Traffic Growth Engine Verification Gate...');
  execSync('node scripts/test-growth-engine.js', { stdio: 'inherit' });

  // Execute Authentication Reliability & Diagnostics Gate
  console.log('[Build Gate] Enforcing Authentication Reliability & Diagnostics Gate...');
  execSync('node scripts/test-auth-diagnostics.js', { stdio: 'inherit' });

  // Execute Authentication Failure Diagnostics Gate (Root cause classification & dev diagnostics)
  console.log('[Build Gate] Enforcing Authentication Failure Diagnostics Gate...');
  execSync('node scripts/test-auth-failure-diagnostics.js', { stdio: 'inherit' });

  // Execute Error Classification & Retry Safety Gate (Schema mismatch & retry safety)
  console.log('[Build Gate] Enforcing Error Classification & Retry Safety Gate...');
  execSync('node scripts/test-error-classification.js', { stdio: 'inherit' });

  // Execute Database Self-Healing & Drift Recovery Gate
  console.log('[Build Gate] Enforcing Database Self-Healing & Drift Recovery Gate...');
  execSync('node scripts/test-db-self-heal.js', { stdio: 'inherit' });

  // Execute Deployment Verification Engine Gate (Health Score, Route Checks, Platform Status & Alerts)
  console.log('[Build Gate] Enforcing Deployment Verification Engine Gate...');
  execSync('node scripts/test-deployment-verification.js', { stdio: 'inherit' });

  // Execute Automatic Post-Deploy Validation Engine Gate (7 Areas & Critical Models)
  console.log('[Build Gate] Enforcing Automatic Post-Deploy Validation Engine Gate...');
  execSync('node scripts/test-post-deploy-engine.js', { stdio: 'inherit' });

  // Execute Storage Malware Protection & Quarantine Gate
  console.log('[Build Gate] Enforcing Storage Malware Protection & Quarantine Gate...');
  execSync('node scripts/test-storage-malware-protection.js', { stdio: 'inherit' });

  // Execute Database Schema Verification Gate (Model & Column Drift Detection)
  console.log('[Build Gate] Enforcing Database Schema Verification Gate...');
  execSync('node scripts/verify-schema-drift.js', { stdio: 'inherit' });

  // Compile Next.js project
  execSync('npx next build', { stdio: 'inherit' });

  // Execute Automated Post-Deployment Database Verification Gate
  console.log('\n[Post-Build Gate] Enforcing Automated Post-Deployment Verification...');
  execSync('node scripts/post-deploy-verify.js', { stdio: 'inherit' });








} catch (error) {
  console.error('[Build Setup] Compilation or Security Gate failed:', error);
  process.exit(1);
}

