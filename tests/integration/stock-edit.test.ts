import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { PATCH } from '@/app/api/stock/items/[productId]/route';
import { createCompanyWithPlan, resetDatabase } from '../helpers';

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

// A rota usa requireSession, que le a sessao do NextAuth. Nos testes a sessao
// e injetada por mock para exercitar a regra de negocio sem subir o servidor.
let companyIdAtual = '';
vi.mock('@/lib/session', () => ({
  requireSession: async () => ({ user: { companyId: companyIdAtual, id: 'u1' } }),
  UnauthorizedError: class extends Error {},
}));

async function chamar(productId: string, body: unknown) {
  const request = new Request('http://localhost/api/stock/items/x', {
    method: 'PATCH',
    body: JSON.stringify(body),
  }) as never;
  return PATCH(request, { params: { productId } });
}

async function criarProduto(companyId: string, overrides?: { trackStock?: boolean }) {
  return prisma.product.create({
    data: {
      companyId,
      name: 'Cabo flexivel 2,5mm2',
      unit: 'm',
      price: 3.5,
      cost: 2,
      stockQuantity: 100,
      trackStock: overrides?.trackStock ?? true,
    },
  });
}

describe('edicao rapida do item em estoque', () => {
  it('altera custo e preco sem gerar movimentacao', async () => {
    const { company } = await createCompanyWithPlan();
    companyIdAtual = company.id;
    const produto = await criarProduto(company.id);

    const res = await chamar(produto.id, { price: 4.2, cost: 2.5, quantity: 100 });
    expect(res.status).toBe(200);

    const atualizado = await prisma.product.findUniqueOrThrow({ where: { id: produto.id } });
    expect(Number(atualizado.price)).toBe(4.2);
    expect(Number(atualizado.cost)).toBe(2.5);
    expect(await prisma.stockMovement.count()).toBe(0);
  });

  // O saldo tem que continuar explicado pelo historico: escrever o numero
  // direto deixaria um estoque que nenhum registro justifica.
  it('registra ajuste de entrada quando a contagem e maior', async () => {
    const { company } = await createCompanyWithPlan();
    companyIdAtual = company.id;
    const produto = await criarProduto(company.id);

    await chamar(produto.id, { quantity: 130 });

    const movimentacoes = await prisma.stockMovement.findMany();
    expect(movimentacoes).toHaveLength(1);
    expect(movimentacoes[0].type).toBe('IN');
    expect(movimentacoes[0].reason).toBe('ADJUSTMENT');
    expect(Number(movimentacoes[0].quantity)).toBe(30);

    const atualizado = await prisma.product.findUniqueOrThrow({ where: { id: produto.id } });
    expect(Number(atualizado.stockQuantity)).toBe(130);
  });

  it('registra ajuste de saida quando a contagem e menor', async () => {
    const { company } = await createCompanyWithPlan();
    companyIdAtual = company.id;
    const produto = await criarProduto(company.id);

    await chamar(produto.id, { quantity: 80 });

    const movimentacao = await prisma.stockMovement.findFirstOrThrow();
    expect(movimentacao.type).toBe('OUT');
    expect(Number(movimentacao.quantity)).toBe(20);
  });

  it('guarda o motivo informado na movimentacao', async () => {
    const { company } = await createCompanyWithPlan();
    companyIdAtual = company.id;
    const produto = await criarProduto(company.id);

    await chamar(produto.id, { quantity: 90, notes: 'Contagem de inventario' });

    const movimentacao = await prisma.stockMovement.findFirstOrThrow();
    expect(movimentacao.notes).toBe('Contagem de inventario');
  });

  it('descreve o ajuste quando nao ha motivo informado', async () => {
    const { company } = await createCompanyWithPlan();
    companyIdAtual = company.id;
    const produto = await criarProduto(company.id);

    await chamar(produto.id, { quantity: 90 });

    const movimentacao = await prisma.stockMovement.findFirstOrThrow();
    expect(movimentacao.notes).toContain('100');
    expect(movimentacao.notes).toContain('90');
  });

  it('recusa ajuste em produto que nao controla estoque', async () => {
    const { company } = await createCompanyWithPlan();
    companyIdAtual = company.id;
    const produto = await criarProduto(company.id, { trackStock: false });

    const res = await chamar(produto.id, { quantity: 50 });
    expect(res.status).toBe(422);
    expect(await prisma.stockMovement.count()).toBe(0);
  });

  it('recusa quantidade negativa', async () => {
    const { company } = await createCompanyWithPlan();
    companyIdAtual = company.id;
    const produto = await criarProduto(company.id);

    const res = await chamar(produto.id, { quantity: -5 });
    expect(res.status).toBe(422);
  });

  it('isola empresas', async () => {
    const { company } = await createCompanyWithPlan();
    const produto = await criarProduto(company.id);

    const outra = await prisma.company.create({
      data: { legalName: 'Outra', documentType: 'CNPJ', document: '99999999000199' },
    });
    companyIdAtual = outra.id;

    const res = await chamar(produto.id, { price: 999 });
    expect(res.status).toBe(404);

    const intacto = await prisma.product.findUniqueOrThrow({ where: { id: produto.id } });
    expect(Number(intacto.price)).toBe(3.5);
  });
});
