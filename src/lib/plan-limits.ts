import { prisma } from '@/lib/prisma';
import { isPremiumTemplate, templateLabel, type PdfTemplateValue } from '@/lib/pdf/template-options';

export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

/**
 * Modelos de PDF premium acompanham a identidade visual personalizada
 * (hasCustomBrand) — hoje presente no Starter e no Profissional, ausente no
 * Grátis. Empresas sem assinatura ficam liberadas, mesma política de
 * assertWithinPlanLimit, para não travar o ambiente de desenvolvimento.
 */
export async function companyAllowsPremiumTemplates(companyId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    include: { plan: true },
  });
  if (!subscription) return true;
  return subscription.plan.hasCustomBrand;
}

function premiumTemplateError(template: string) {
  return new PlanLimitError(
    `O modelo "${templateLabel(template)}" está disponível a partir do plano Starter. Faça upgrade do seu plano para usá-lo.`,
  );
}

/**
 * Bloqueia a escolha explícita de um modelo premium por quem não tem plano
 * para isso. Usada onde o modelo é uma decisão direta do usuário.
 */
export async function assertTemplateAllowed(
  companyId: string,
  template: PdfTemplateValue | null | undefined,
) {
  if (!isPremiumTemplate(template)) return;
  if (await companyAllowsPremiumTemplates(companyId)) return;
  throw premiumTemplateError(template as string);
}

/**
 * Resolve o modelo de um orçamento novo. Escolha explícita de modelo premium
 * sem plano vira erro; já o modelo herdado do padrão da empresa (caso de quem
 * configurou um premium e depois rebaixou o plano) cai para CLASSIC em
 * silêncio, para o rebaixamento não impedir a criação de orçamentos.
 */
export async function resolveQuoteTemplate(
  companyId: string,
  requested: PdfTemplateValue | null | undefined,
  companyDefault: PdfTemplateValue,
): Promise<PdfTemplateValue> {
  const allowed = await companyAllowsPremiumTemplates(companyId);

  if (requested) {
    if (isPremiumTemplate(requested) && !allowed) throw premiumTemplateError(requested);
    return requested;
  }

  return isPremiumTemplate(companyDefault) && !allowed ? 'CLASSIC' : companyDefault;
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
