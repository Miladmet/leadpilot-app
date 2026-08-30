const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admettre@gmail.com';
  const newPassword = process.argv[3] || 'Password123!';

  console.log(`Resetting password for: ${email}`);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User ${email} not found in database.`);
    process.exit(1);
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });

  console.log(`✅ Password successfully updated!`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${newPassword}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
