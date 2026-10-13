import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { issueInvoiceForQuote, cancelInvoice, refreshInvoice } from '@/lib/nfe/issue';
import { FiscalDataError } from '@/lib/nfe';
import { createCompanyWithPlan, createClient, resetDatabase } from '../helpers';

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

/** Empresa, cliente e produto com todos os campos fiscais preenchidos. */
async function cenarioCompleto() {
  const { company } = await createCompanyWithPlan();
  const client = await createClient(company.id);
  const product = await prisma.product.create({
    data: {
      companyId: company.id,
      name: 'Switch gerenciavel 24 portas',
      code: 'SW-24',
      unit: 'un',
      price: 2450,
      ncm: '85176294',
      cfop: '5102',
    },
  });
  return { company, client, product };
}

async function criarOrcamento(
  companyId: string,
  clientId: string,
  productId: string | null,
  status: 'APPROVED' | 'SENT' = 'APPROVED',
  numero = 1,
) {
  return prisma.quote.create({
    data: {
      companyId,
      number: numero,
      clientId,
      status,
      validUntil: new Date(Date.now() + 15 * 86400000),
      subtotal: 4900,
      total: 4900,
      publicToken: `token-${numero}-${Date.now()}`,
      items: {
        create: [
          {
            productId,
            description: 'Switch gerenciavel 24 portas',
            quantity: 2,
            unitPrice: 2450,
            total: 4900,
            order: 0,
          },
        ],
      },
    },
  });
}

describe('validacao fiscal antes do envio', () => {
  it('lista o que falta em vez de deixar a SEFAZ recusar', async () => {
    const { company } = await createCompanyWithPlan();
    await prisma.company.update({
      where: { id: company.id },
      data: { stateRegistration: null, cityCode: null },
    });
    const client = await createClient(company.id);
    await prisma.client.update({ where: { id: client.id }, data: { cityCode: null } });
    const product = await prisma.product.create({
      data: { companyId: company.id, name: 'Sem NCM', unit: 'un' },
    });
    const quote = await criarOrcamento(company.id, client.id, product.id);

    await expect(issueInvoiceForQuote(company.id, quote.id)).rejects.toBeInstanceOf(FiscalDataError);

    try {
      await issueInvoiceForQuote(company.id, quote.id);
    } catch (erro) {
      const faltando = (erro as FiscalDataError).missing.join(' | ');
      expect(faltando).toContain('Inscrição Estadual da empresa');
      expect(faltando).toContain('Código IBGE');
      expect(faltando).toContain('NCM');
    }
  });

  // Numeracao fiscal e sequencial e nao pode ganhar buraco por validacao falha.
  it('nao consome numeracao quando a validacao falha', async () => {
    const { company } = await createCompanyWithPlan();
    await prisma.company.update({ where: { id: company.id }, data: { stateRegistration: null } });
    const client = await createClient(company.id);
    const product = await prisma.product.create({
      data: { companyId: company.id, name: 'X', unit: 'un', ncm: '85176294' },
    });
    const quote = await criarOrcamento(company.id, client.id, product.id);

    await expect(issueInvoiceForQuote(company.id, quote.id)).rejects.toThrow();

    const atual = await prisma.company.findUniqueOrThrow({ where: { id: company.id } });
    expect(atual.nfeNextNumber).toBe(1);
    expect(await prisma.invoice.count()).toBe(0);
  });

  it('exige produto cadastrado no item, porque NF-e pede NCM por item', async () => {
    const { company, client } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, null);

    await expect(issueInvoiceForQuote(company.id, quote.id)).rejects.toBeInstanceOf(FiscalDataError);
  });
});

describe('emissao pelo provedor de teste', () => {
  it('autoriza e grava chave de acesso de 44 digitos', async () => {
    const { company, client, product } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, product.id);

    const invoice = await issueInvoiceForQuote(company.id, quote.id);

    expect(invoice.status).toBe('AUTHORIZED');
    expect(invoice.accessKey).toMatch(/^\d{44}$/);
    expect(invoice.number).toBe(1);
    expect(invoice.series).toBe(1);
    expect(invoice.environment).toBe('HOMOLOGACAO');
    expect(invoice.issuedAt).not.toBeNull();
  });

  it('avanca a numeracao a cada emissao', async () => {
    const { company, client, product } = await cenarioCompleto();
    const q1 = await criarOrcamento(company.id, client.id, product.id, 'APPROVED', 1);
    const q2 = await criarOrcamento(company.id, client.id, product.id, 'APPROVED', 2);

    const n1 = await issueInvoiceForQuote(company.id, q1.id);
    const n2 = await issueInvoiceForQuote(company.id, q2.id);

    expect(n1.number).toBe(1);
    expect(n2.number).toBe(2);
  });
});

describe('regras de negocio da emissao', () => {
  it('exige orcamento aprovado', async () => {
    const { company, client, product } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, product.id, 'SENT');

    await expect(issueInvoiceForQuote(company.id, quote.id)).rejects.toMatchObject({ status: 422 });
  });

  it('bloqueia segunda emissao do mesmo orcamento', async () => {
    const { company, client, product } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, product.id);
    await issueInvoiceForQuote(company.id, quote.id);

    await expect(issueInvoiceForQuote(company.id, quote.id)).rejects.toMatchObject({ status: 409 });
  });

  // Toda leitura filtra por companyId: uma empresa nao pode emitir nota do
  // orcamento de outra.
  it('isola empresas', async () => {
    const { company, client, product } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, product.id);
    const outra = await prisma.company.create({
      data: { legalName: 'Outra', documentType: 'CNPJ', document: '99999999000199' },
    });

    await expect(issueInvoiceForQuote(outra.id, quote.id)).rejects.toMatchObject({ status: 404 });
  });
});

describe('cancelamento', () => {
  it('exige justificativa de ao menos 15 caracteres, como a SEFAZ', async () => {
    const { company, client, product } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, product.id);
    const invoice = await issueInvoiceForQuote(company.id, quote.id);

    await expect(cancelInvoice(company.id, invoice.id, 'erro')).rejects.toMatchObject({
      status: 422,
    });
  });

  it('cancela nota autorizada e registra a data', async () => {
    const { company, client, product } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, product.id);
    const invoice = await issueInvoiceForQuote(company.id, quote.id);

    const cancelada = await cancelInvoice(
      company.id,
      invoice.id,
      'Emitida com dados incorretos do destinatario',
    );

    expect(cancelada.status).toBe('CANCELED');
    expect(cancelada.canceledAt).not.toBeNull();
  });

  it('permite reemitir depois do cancelamento', async () => {
    const { company, client, product } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, product.id);
    const invoice = await issueInvoiceForQuote(company.id, quote.id);
    await cancelInvoice(company.id, invoice.id, 'Emitida com dados incorretos do cliente');

    const nova = await issueInvoiceForQuote(company.id, quote.id);
    expect(nova.status).toBe('AUTHORIZED');
    expect(nova.number).toBe(2);
  });
});

describe('consulta de retorno', () => {
  it('reconsulta a nota no provedor', async () => {
    const { company, client, product } = await cenarioCompleto();
    const quote = await criarOrcamento(company.id, client.id, product.id);
    const invoice = await issueInvoiceForQuote(company.id, quote.id);

    const atualizada = await refreshInvoice(company.id, invoice.id);
    expect(atualizada.status).toBe('AUTHORIZED');
  });
});
