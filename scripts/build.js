const { execSync } = require('child_process');

// Detect if we are running in Vercel or a production environment
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const schemaPath = isProduction ? 'prisma/schema.prod.prisma' : 'prisma/schema.prisma';

console.log(`[Build Setup] Detected production=${isProduction}. Using schema: ${schemaPath}`);

try {
  // Generate Prisma Client for the active provider
  execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });

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

  // Compile Next.js project
  execSync('npx next build', { stdio: 'inherit' });



} catch (error) {
  console.error('[Build Setup] Compilation or Security Gate failed:', error);
  process.exit(1);
}

