import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
