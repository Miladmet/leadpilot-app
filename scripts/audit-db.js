const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('LEADPILOT PRODUCTION DATABASE CONNECTION AUDIT');
  console.log('================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

  let host = 'localhost (SQLite)';
  let port = 'N/A';
  let database = 'dev.db';
  let username = 'N/A';
  let supabaseProjectId = 'N/A';

  if (isPostgres) {
    try {
      const parsed = new URL(dbUrl);
      host = parsed.hostname;
      port = parsed.port || '5432';
      database = parsed.pathname.replace(/^\//, '');
      username = parsed.username;

      if (host.includes('supabase.co')) {
        supabaseProjectId = host.split('.')[0];
      } else if (username.startsWith('postgres.')) {
        supabaseProjectId = username.split('.')[1];
      } else if (host.includes('pooler.supabase.com')) {
        supabaseProjectId = username.includes('.') ? username.split('.')[1] : 'Supabase Pooler';
      }
    } catch (e) {
      host = `Error: ${e.message}`;
    }
  }

  console.log('1. CONNECTION DETAILS:');
  console.log(`   - DATABASE_URL Host:   ${host}`);
  console.log(`   - Port:                ${port}`);
  console.log(`   - Database Name:       ${database}`);
  console.log(`   - Supabase Project ID: ${supabaseProjectId}`);
  console.log(`   - Provider:            ${isPostgres ? 'PostgreSQL' : 'SQLite'}\n`);

  console.log('2. QUERYING TABLES LIKE "%prospect%"...');
  let tables = [];
  if (isPostgres) {
    tables = await prisma.$queryRawUnsafe(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE LOWER(table_name) LIKE '%prospect%';
    `);
  } else {
    tables = await prisma.$queryRawUnsafe(`
      SELECT 'main' as table_schema, name as table_name
      FROM sqlite_master
      WHERE type='table' AND LOWER(name) LIKE '%prospect%';
    `);
  }
  console.table(tables);

  console.log('\n3. QUERYING COLUMNS WHERE LOWER(column_name)="analysisversion"...');
  let cols = [];
  if (isPostgres) {
    cols = await prisma.$queryRawUnsafe(`
      SELECT table_schema, table_name, column_name, data_type
      FROM information_schema.columns
      WHERE LOWER(column_name) = 'analysisversion';
    `);
  } else {
    const raw = await prisma.$queryRawUnsafe(`PRAGMA table_info("Prospect");`);
    cols = raw
      .filter(c => c.name.toLowerCase() === 'analysisversion')
      .map(c => ({ table_schema: 'main', table_name: 'Prospect', column_name: c.name, data_type: c.type }));
  }
  console.table(cols);

  console.log('\n4. PRISMA CLIENT LIVE QUERY TEST:');
  try {
    const res = await prisma.prospect.findFirst({
      select: { id: true, analysisVersion: true }
    });
    console.log('   [SUCCESS] prisma.prospect.findFirst({ select: { id: true, analysisVersion: true } }) returned:');
    console.log('   ', res);
  } catch (err) {
    console.error('   [FAILED] Prisma Query Threw Error:');
    console.error('   Code:   ', err.code);
    console.error('   Message:', err.message);
  }

  console.log('\n================================================================');
  console.log('AUDIT COMPLETE');
  console.log('================================================================');
}

main().catch(console.error).finally(() => prisma.$disconnect());
