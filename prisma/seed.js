const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { nationalId: '3733161580' },
    update: {},
    create: {
      nationalId: '3733161580',
      phoneNumber: '09185227309',
      firstName: 'مدیر',
      lastName: 'سیستم',
      city: 'کردستان',
      role: 'ADMIN',
      isActive: true,
      password: 'admin123',
    },
  });

  // Create representative user
  const representative = await prisma.user.upsert({
    where: { nationalId: '3850152359' },
    update: {},
    create: {
      nationalId: '3850152359',
      phoneNumber: '09186505181',
      firstName: 'سروه',
      lastName: 'میرزائی',
      city: 'دیواندره',
      role: 'REPRESENTATIVE',
      isActive: true,
      password: 'rep123',
    },
  });

  console.log({ admin, representative });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 