import { prisma } from '@/lib/prisma';

/**
 * Apaga os dados entre casos. A ordem respeita as chaves estrangeiras que nao
 * tem cascade — Invoice aponta para Client sem onDelete, entao precisa sair
 * antes.
 */
export async function resetDatabase() {
  await prisma.invoice.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.rateLimit.deleteMany();
}

let planCounter = 0;

/** Cria empresa com plano. Sem plano, as regras liberam tudo por padrao. */
export async function createCompanyWithPlan(overrides?: {
  hasAiFeatures?: boolean;
  hasCustomBrand?: boolean;
  maxProducts?: number;
  maxQuotesPerMonth?: number;
  maxClients?: number;
}) {
  planCounter += 1;
  const plan = await prisma.plan.create({
    data: {
      slug: `plano-teste-${planCounter}-${Date.now()}`,
      name: `Plano Teste ${planCounter}`,
      priceMonthly: 0,
      maxQuotesPerMonth: overrides?.maxQuotesPerMonth ?? 100,
      maxClients: overrides?.maxClients ?? 100,
      maxProducts: overrides?.maxProducts ?? 100,
      maxUsers: 1,
      hasAiFeatures: overrides?.hasAiFeatures ?? true,
      hasCustomBrand: overrides?.hasCustomBrand ?? true,
    },
  });

  const company = await prisma.company.create({
    data: {
      legalName: 'Empresa de Teste LTDA',
      documentType: 'CNPJ',
      document: '12345678000199',
      addressStreet: 'Rua Teste',
      addressNumber: '100',
      addressNeighborhood: 'Centro',
      addressCity: 'Sao Paulo',
      addressState: 'SP',
      addressZipCode: '01310100',
      stateRegistration: '110042490114',
      cityCode: '3550308',
    },
  });

  await prisma.subscription.create({
    data: { companyId: company.id, planId: plan.id, status: 'ACTIVE' },
  });

  return { company, plan };
}

export async function createClient(companyId: string) {
  return prisma.client.create({
    data: {
      companyId,
      type: 'PJ',
      name: 'Cliente de Teste S/A',
      document: '98765432000155',
      addressStreet: 'Av. Teste',
      addressNumber: '200',
      addressNeighborhood: 'Centro',
      addressCity: 'Campinas',
      addressState: 'SP',
      addressZipCode: '13040200',
      cityCode: '3509502',
    },
  });
}
