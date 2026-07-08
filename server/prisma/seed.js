import { prisma } from '../src/config/prisma.js';
import bcrypt from 'bcryptjs'; // Note: make sure this matches what you installed (bcrypt vs bcryptjs)

async function main() {
  console.log('⏳ INITIATING_DATABASE_SEED...');

  // 1. Provision a Corporate Tenant Workspace
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'stripe' },
    update: {},
    create: {
      id: 'tenant_stripe_001',
      name: 'Stripe',
      subdomain: 'stripe',
    },
  });

  // 2. Cryptographically Hash the Password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Provision a Recruiter Account bound to the Tenant
  const user = await prisma.user.upsert({
    where: { email: 'recruiter@stripe.com' },
    update: {
      password: hashedPassword 
    },
    create: {
      email: 'recruiter@stripe.com',
      password: hashedPassword, 
      role: 'RECRUITER',
      tenantId: tenant.id,
    },
  });

  console.log('✅ SEED_SUCCESSFUL:');
  console.log(`🏢 Workspace: ${tenant.name} (Subdomain: ${tenant.subdomain})`);
  console.log(`👤 Recruiter: ${user.email} | Password: password123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });