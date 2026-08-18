import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  PlanLimitError,
  assertAiAllowed,
  assertTemplateAllowed,
  assertWithinPlanLimit,
  companyAllowsAi,
  companyAllowsPremiumTemplates,
  resolveQuoteTemplate,
} from '@/lib/plan-limits';
import { createCompanyWithPlan, createClient, resetDatabase } from '../helpers';

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('recursos de IA', () => {
  it('libera quando o plano inclui IA', async () => {
    const { company } = await createCompanyWithPlan({ hasAiFeatures: true });
    expect(await companyAllowsAi(company.id)).toBe(true);
    await expect(assertAiAllowed(company.id)).resolves.toBeUndefined();
  });

  it('barra quando o plano nao inclui IA', async () => {
    const { company } = await createCompanyWithPlan({ hasAiFeatures: false });
    expect(await companyAllowsAi(company.id)).toBe(false);
    await expect(assertAiAllowed(company.id)).rejects.toBeInstanceOf(PlanLimitError);
  });

  // Sem assinatura o desenvolvimento local travaria por completo.
  it('libera empresa sem assinatura', async () => {
    const company = await prisma.company.create({
      data: { legalName: 'Sem Plano', documentType: 'CNPJ', document: '11111111000111' },
    });
    expect(await companyAllowsAi(company.id)).toBe(true);
  });
});

describe('modelos de PDF premium', () => {
  it('barra modelo premium sem plano com identidade visual', async () => {
    const { company } = await createCompanyWithPlan({ hasCustomBrand: false });
    expect(await companyAllowsPremiumTemplates(company.id)).toBe(false);
    await expect(assertTemplateAllowed(company.id, 'EXECUTIVE')).rejects.toBeInstanceOf(
      PlanLimitError,
    );
  });

  it('deixa passar modelo comum em qualquer plano', async () => {
    const { company } = await createCompanyWithPlan({ hasCustomBrand: false });
    await expect(assertTemplateAllowed(company.id, 'CLASSIC')).resolves.toBeUndefined();
  });

  it('aceita premium quando o plano cobre', async () => {
    const { company } = await createCompanyWithPlan({ hasCustomBrand: true });
    await expect(assertTemplateAllowed(company.id, 'CATALOG')).resolves.toBeUndefined();
  });

  // Escolha explicita barra; heranca do padrao da empresa nao pode travar a
  // criacao de orcamento de quem rebaixou o plano.
  it('cai para CLASSIC quando herda padrao premium sem direito', async () => {
    const { company } = await createCompanyWithPlan({ hasCustomBrand: false });
    expect(await resolveQuoteTemplate(company.id, undefined, 'EXECUTIVE')).toBe('CLASSIC');
  });

  it('mantem o padrao herdado quando ele nao e premium', async () => {
    const { company } = await createCompanyWithPlan({ hasCustomBrand: false });
    expect(await resolveQuoteTemplate(company.id, undefined, 'MODERN')).toBe('MODERN');
  });

  it('rejeita escolha explicita de premium sem direito', async () => {
    const { company } = await createCompanyWithPlan({ hasCustomBrand: false });
    await expect(resolveQuoteTemplate(company.id, 'SIDEBAR', 'CLASSIC')).rejects.toBeInstanceOf(
      PlanLimitError,
    );
  });
});

describe('limites de uso do plano', () => {
  it('bloqueia produto acima do teto', async () => {
    const { company } = await createCompanyWithPlan({ maxProducts: 2 });
    await prisma.product.createMany({
      data: [
        { companyId: company.id, name: 'A' },
        { companyId: company.id, name: 'B' },
      ],
    });
    await expect(assertWithinPlanLimit(company.id, 'product')).rejects.toBeInstanceOf(
      PlanLimitError,
    );
  });

  it('permite enquanto estiver abaixo do teto', async () => {
    const { company } = await createCompanyWithPlan({ maxProducts: 2 });
    await prisma.product.create({ data: { companyId: company.id, name: 'A' } });
    await expect(assertWithinPlanLimit(company.id, 'product')).resolves.toBeUndefined();
  });

  it('bloqueia cliente acima do teto', async () => {
    const { company } = await createCompanyWithPlan({ maxClients: 1 });
    await createClient(company.id);
    await expect(assertWithinPlanLimit(company.id, 'client')).rejects.toBeInstanceOf(PlanLimitError);
  });

  // O limite de orcamento e por mes: registro do mes passado nao conta.
  it('conta orcamento apenas do mes corrente', async () => {
    const { company } = await createCompanyWithPlan({ maxQuotesPerMonth: 1 });
    const client = await createClient(company.id);

    const mesPassado = new Date();
    mesPassado.setMonth(mesPassado.getMonth() - 1);

    await prisma.quote.create({
      data: {
        companyId: company.id,
        number: 1,
        clientId: client.id,
        validUntil: new Date(),
        subtotal: 0,
        total: 0,
        publicToken: 'token-mes-passado',
        createdAt: mesPassado,
      },
    });

    await expect(assertWithinPlanLimit(company.id, 'quote')).resolves.toBeUndefined();
  });
});
