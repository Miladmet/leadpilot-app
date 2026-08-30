const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const info = await prisma.$queryRawUnsafe('PRAGMA table_info("Prospect");');
  const cols = info.map(c => c.name);
  console.log('Columns in local SQLite Prospect table:', cols.length);
  console.log('Has analysisVersion:', cols.includes('analysisVersion'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
