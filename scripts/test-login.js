const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admettre@gmail.com' } });
  const matches = bcrypt.compareSync('Password123!', user.passwordHash);
  console.log('Login verification check with Password123!:', matches ? '✅ SUCCESS' : '❌ FAILED');
}

main().finally(() => prisma.$disconnect());
