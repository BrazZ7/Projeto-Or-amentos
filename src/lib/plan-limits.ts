import { prisma } from '@/lib/prisma';

export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

/**
 * Garante que a empresa não ultrapasse os limites do seu plano antes de criar
 * um novo orçamento, cliente ou produto. Empresas sem assinatura (ex: dados
 * de seed ausentes) não são bloqueadas, para não travar o ambiente de
 * desenvolvimento.
 */
export async function assertWithinPlanLimit(
  companyId: string,
  resource: 'quote' | 'client' | 'product',
) {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    include: { plan: true },
  });
  if (!subscription) return;

  if (resource === 'quote') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await prisma.quote.count({
      where: { companyId, createdAt: { gte: startOfMonth } },
    });
    if (count >= subscription.plan.maxQuotesPerMonth) {
      throw new PlanLimitError(
        `Limite de ${subscription.plan.maxQuotesPerMonth} orçamentos/mês do plano ${subscription.plan.name} atingido. Faça upgrade do seu plano para continuar.`,
      );
    }
  }

  if (resource === 'client') {
    const count = await prisma.client.count({ where: { companyId } });
    if (count >= subscription.plan.maxClients) {
      throw new PlanLimitError(
        `Limite de ${subscription.plan.maxClients} clientes do plano ${subscription.plan.name} atingido. Faça upgrade do seu plano para continuar.`,
      );
    }
  }

  if (resource === 'product') {
    const count = await prisma.product.count({ where: { companyId } });
    if (count >= subscription.plan.maxProducts) {
      throw new PlanLimitError(
        `Limite de ${subscription.plan.maxProducts} produtos do plano ${subscription.plan.name} atingido. Faça upgrade do seu plano para continuar.`,
      );
    }
  }
}
