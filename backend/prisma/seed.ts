import { PrismaClient, UserRole, CompanyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding plans...');
  // Create Plans
  const starterPlan = await prisma.plan.upsert({
    where: { name: 'Starter' },
    update: {},
    create: {
      name: 'Starter',
      monthlyPrice: 99.00,
      yearlyPrice: 990.00,
      features: { maxEmployees: 10, maxEvents: 15, aiAssistant: false },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'Professional' },
    update: {},
    create: {
      name: 'Professional',
      monthlyPrice: 199.00,
      yearlyPrice: 1990.00,
      features: { maxEmployees: 100, maxEvents: 100, aiAssistant: true },
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      monthlyPrice: 499.00,
      yearlyPrice: 4990.00,
      features: { maxEmployees: 10000, maxEvents: 10000, aiAssistant: true },
    },
  });

  console.log('Seeding default platform Super Admin...');
  // Create Super Admin User
  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin123!', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@evento.com' },
    update: {},
    create: {
      email: 'superadmin@evento.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: superAdminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('Seeding registration requests...');
  // Create sample company registrations
  await prisma.companyRegistration.upsert({
    where: { id: 'a52f4c4a-6750-482a-bc95-0f66ebcf006a' }, // Static UUID to prevent duplicate seeding
    update: {},
    create: {
      id: 'a52f4c4a-6750-482a-bc95-0f66ebcf006a',
      companyName: 'Shutter Photography',
      ownerName: 'Alex Mercer',
      email: 'alex@shutter.com',
      phone: '+971501234567',
      country: 'UAE',
      city: 'Dubai',
      tradeLicenseUrl: 'https://placeholder.com/trade-license.pdf',
      logoUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=80&h=80&fit=crop',
      employeeCount: 8,
      status: CompanyStatus.PENDING,
    },
  });

  await prisma.companyRegistration.upsert({
    where: { id: 'd748f219-c187-43f1-b956-f6d2994fbc11' },
    update: {},
    create: {
      id: 'd748f219-c187-43f1-b956-f6d2994fbc11',
      companyName: 'Royal Weddings',
      ownerName: 'Sarah Jenkins',
      email: 'sarah@royalweddings.com',
      phone: '+971529876543',
      country: 'UAE',
      city: 'Abu Dhabi',
      tradeLicenseUrl: 'https://placeholder.com/license-royal.pdf',
      logoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=80&h=80&fit=crop',
      employeeCount: 15,
      status: CompanyStatus.PENDING,
    },
  });

  console.log({
    superAdminEmail: superAdmin.email,
    superAdminPassword: 'SuperAdmin123!',
    plans: [starterPlan.name, proPlan.name, enterprisePlan.name],
  });
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
