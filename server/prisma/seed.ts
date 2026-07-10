import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@workride.com' },
    update: {},
    create: {
      email: 'admin@workride.com',
      fullname: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      karmaPoints: 0,
      creditScore: 0,
    },
  });

  console.log('Admin user created:', {
    id: admin.id,
    email: admin.email,
    fullname: admin.fullname,
    role: admin.role,
  });
  
  console.log('\n--- Admin Credentials ---');
  console.log('Email: admin@workride.com');
  console.log('Password: admin123');
  console.log('------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
