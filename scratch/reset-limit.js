const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { email: 'admettre@gmail.com' },
    data: {
      subscriptionTier: 'AGENCY',
      analysesLimit: 999999,
      analysesUsed: 0
    }
  });
  console.log('Successfully upgraded user account limits:');
  console.log(JSON.stringify(updated, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
