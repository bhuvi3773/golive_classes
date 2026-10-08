import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@goliveclasses.com';
  const password = 'SuperAdmin123!';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'superadmin',
      isVerified: true,
      password: hashedPassword
    },
    create: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'superadmin',
      isVerified: true,
      authProvider: 'email'
    }
  });

  console.log('Superadmin user ensured in database:');
  console.log('Email:', email);
  console.log('Password:', password);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
