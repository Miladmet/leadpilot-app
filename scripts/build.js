const { execSync } = require('child_process');

// Detect if we are running in Vercel or a production environment
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const schemaPath = isProduction ? 'prisma/schema.prod.prisma' : 'prisma/schema.prisma';

console.log(`[Build Setup] Detected production=${isProduction}. Using schema: ${schemaPath}`);

try {
  // Generate Prisma Client for the active provider
  execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });

  // In production, execute the RLS Security Gate to block deployment if customer tables lack RLS
  if (isProduction && process.env.DATABASE_URL) {
    console.log('[Build Gate] Enforcing Multi-Tenant Row Level Security (RLS) check...');
    execSync('node scripts/verify-rls.js', { stdio: 'inherit' });
  }

  // Compile Next.js project
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('[Build Setup] Compilation or Security Gate failed:', error);
  process.exit(1);
}

