import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/promote-admin.mjs <email>');
  console.log('\nCurrent users:');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullname: true, role: true },
  });
  console.table(users);
  await prisma.$disconnect();
  process.exit(1);
}

const user = await prisma.user.update({
  where: { email },
  data: { role: 'ADMIN' },
  select: { id: true, email: true, fullname: true, role: true },
});

console.log('Promoted to admin:');
console.log(user);

await prisma.$disconnect();
