import { PrismaClient } from '@prisma/client';

function getNormalizedDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  url = url.trim();
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  const match = url.match(/(?:postgres(?:ql)?:\/\/.*)/i);
  if (match) {
    url = match[0].trim();
  }

  const isPostgres = url.startsWith('postgres://') || url.startsWith('postgresql://');
  const isSupabase = url.includes('supabase.co') || url.includes('supabase.com') || url.includes('pooler');

  // Supabase (Direct or Pooler on Vercel):
  // When running on serverless platforms, connections are pooled and reused across function invocations.
  // Prisma MUST use pgbouncer=true to disable named prepared statements (which cause PostgreSQL 42P05 "prepared statement s1 already exists").
  if (isPostgres && (isSupabase || url.includes(':6543') || process.env.VERCEL)) {
    if (!url.includes('pgbouncer=true')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}pgbouncer=true&connection_limit=1`;
    }
  }
  return url;
}

let prisma: PrismaClient;

const normalizedUrl = getNormalizedDatabaseUrl();

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(
    normalizedUrl ? { datasources: { db: { url: normalizedUrl } } } : undefined
  );
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient(
      normalizedUrl ? { datasources: { db: { url: normalizedUrl } } } : undefined
    );
  }
  prisma = (global as any).prisma;
}

export default prisma;
