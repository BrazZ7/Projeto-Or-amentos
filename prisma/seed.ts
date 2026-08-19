import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@orcafacil.com';
const DEMO_PASSWORD = 'Demo@1234';

async function main() {
  const plans = [
    {
      slug: 'gratis',
      name: 'Grátis',
      priceMonthly: 0,
      maxQuotesPerMonth: 5,
      maxClients: 10,
      maxProducts: 10,
      maxUsers: 1,
      hasAiFeatures: false,
      hasCustomBrand: false,
    },
    {
      slug: 'starter',
      name: 'Starter',
      priceMonthly: 49.9,
      maxQuotesPerMonth: 50,
      maxClients: 200,
      maxProducts: 200,
      maxUsers: 3,
      hasAiFeatures: true,
      hasCustomBrand: true,
      stripePriceId: process.env.STRIPE_PRICE_ID_STARTER || null,
    },
    {
      slug: 'pro',
      name: 'Profissional',
      priceMonthly: 129.9,
      maxQuotesPerMonth: 500,
      maxClients: 2000,
      maxProducts: 2000,
      maxUsers: 10,
      hasAiFeatures: true,
      hasCustomBrand: true,
      stripePriceId: process.env.STRIPE_PRICE_ID_PRO || null,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  console.log(`Planos cadastrados: ${plans.map((p) => p.name).join(', ')}`);

  const existingDemoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (existingDemoUser) {
    console.log(`Usuário de demonstração já existe: ${DEMO_EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const company = await prisma.company.create({
    data: {
      legalName: 'Empresa Demonstração LTDA',
      tradeName: 'Empresa Demonstração',
      documentType: 'CNPJ',
      document: '00000000000191',
      email: DEMO_EMAIL,
      phone: '11999990000',
      whatsapp: '11999990000',
      addressCity: 'São Paulo',
      addressState: 'SP',
    },
  });

  const starterPlan = await prisma.plan.findUnique({ where: { slug: 'starter' } });
  if (starterPlan) {
    await prisma.subscription.create({
      data: {
        companyId: company.id,
        planId: starterPlan.id,
        status: 'TRIALING',
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Usuário Demonstração',
      email: DEMO_EMAIL,
      passwordHash,
      role: 'OWNER',
      emailVerified: new Date(),
    },
  });

  console.log(`Usuário de demonstração criado — e-mail: ${DEMO_EMAIL} / senha: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
