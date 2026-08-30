import { PrismaClient } from '@prisma/client';

function getNormalizedDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Supabase connection pooler optimization:
  // When connecting via port 6543 or pooler.supabase.com, Prisma must disable
  // prepared statements via pgbouncer=true so DDL schema updates are immediately recognized.
  if (url.includes('pooler.supabase.com') || url.includes(':6543')) {
    if (!url.includes('pgbouncer=true')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}pgbouncer=true&connection_limit=1`;
    }
  }
  return url;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const customUrl = getNormalizedDatabaseUrl();
  prisma = new PrismaClient(
    customUrl ? { datasources: { db: { url: customUrl } } } : undefined
  );
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;
