import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node scripts/reset-password.mjs <email> <new-password>');
  await prisma.$disconnect();
  process.exit(1);
}

const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

const user = await prisma.user.update({
  where: { email },
  data: { password: hashedPassword },
  select: { id: true, email: true, fullname: true, role: true },
});

console.log(`Password updated for ${user.email} (${user.role})`);

await prisma.$disconnect();
