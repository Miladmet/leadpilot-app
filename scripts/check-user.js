const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, passwordHash: true, createdAt: true }
  });
  console.log('Registered Users in DB:');
  for (const u of users) {
    console.log(`- Email: ${u.email} (Created: ${u.createdAt})`);
  }
}

main().finally(() => prisma.$disconnect());
