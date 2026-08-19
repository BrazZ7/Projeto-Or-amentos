import type { Invoice } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildNfeRequest } from './build-request';
import { getNfeProvider } from './index';
import type { NfeResult } from './types';
import { NfeProviderError } from './types';

function statusFields(result: NfeResult) {
  return {
    status: result.status,
    providerRef: result.providerRef,
    accessKey: result.accessKey,
    protocol: result.protocol,
    xmlUrl: result.xmlUrl,
    danfeUrl: result.danfeUrl,
    rejectionCode: result.rejectionCode,
    rejectionMessage: result.rejectionMessage,
    ...(result.status === 'AUTHORIZED' ? { issuedAt: new Date() } : {}),
    ...(result.status === 'CANCELED' ? { canceledAt: new Date() } : {}),
  };
}

/**
 * Emite a NF-e de um orçamento aprovado. Toda leitura é filtrada por
 * companyId, como no resto da aplicação.
 */
export async function issueInvoiceForQuote(companyId: string, quoteId: string): Promise<Invoice> {
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, companyId },
    include: { items: { orderBy: { order: 'asc' }, include: { product: true } }, client: true },
  });
  if (!quote) throw Object.assign(new Error('Orçamento não encontrado.'), { status: 404 });

  if (quote.status !== 'APPROVED') {
    throw Object.assign(
      new Error('A NF-e só pode ser emitida para um orçamento aprovado pelo cliente.'),
      { status: 422 },
    );
  }

  // Uma nota autorizada ou em processamento bloqueia nova emissão; rejeitada
  // ou cancelada, não — o usuário corrige o dado e tenta de novo.
  const blocking = await prisma.invoice.findFirst({
    where: { quoteId, status: { in: ['AUTHORIZED', 'PROCESSING', 'PENDING'] } },
  });
  if (blocking) {
    throw Object.assign(
      new Error(
        blocking.status === 'AUTHORIZED'
          ? `Este orçamento já tem a NF-e ${blocking.number} autorizada.`
          : 'Já existe uma emissão em andamento para este orçamento.',
      ),
      { status: 409 },
    );
  }

  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });

  // Validação fiscal antes de consumir número: uma FiscalDataError aqui não
  // queima numeração nem deixa registro pela metade.
  const request = buildNfeRequest({
    quote,
    company,
    client: quote.client,
    reference: 'pending',
    number: company.nfeNextNumber,
  });

  const invoice = await prisma.$transaction(async (tx) => {
    const updated = await tx.company.update({
      where: { id: companyId },
      data: { nfeNextNumber: { increment: 1 } },
    });
    const number = updated.nfeNextNumber - 1;

    return tx.invoice.create({
      data: {
        companyId,
        quoteId: quote.id,
        clientId: quote.clientId,
        status: 'PENDING',
        environment: company.nfeEnvironment,
        number,
        series: company.nfeSeries,
        operationNature: request.operationNature,
        totalAmount: quote.total,
      },
    });
  });

  request.number = invoice.number;
  request.reference = invoice.id;

  const provider = getNfeProvider(company.nfeEnvironment);

  try {
    const result = await provider.issue(request);
    return prisma.invoice.update({ where: { id: invoice.id }, data: statusFields(result) });
  } catch (error) {
    // Falha de comunicação deixa a nota em ERROR com a mensagem do provedor,
    // em vez de sumir com o registro: o número já foi consumido e a nota pode
    // ter chegado à SEFAZ.
    const message =
      error instanceof NfeProviderError ? error.message : 'Falha ao comunicar com o provedor fiscal.';
    return prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'ERROR', rejectionMessage: message, providerRef: invoice.id },
    });
  }
}

/** Reconsulta o desfecho de uma nota que ficou em processamento. */
export async function refreshInvoice(companyId: string, invoiceId: string): Promise<Invoice> {
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId } });
  if (!invoice) throw Object.assign(new Error('Nota fiscal não encontrada.'), { status: 404 });
  if (!invoice.providerRef) return invoice;

  const provider = getNfeProvider(invoice.environment);
  const result = await provider.consult(invoice.providerRef);
  return prisma.invoice.update({ where: { id: invoice.id }, data: statusFields(result) });
}

export async function cancelInvoice(companyId: string, invoiceId: string, reason: string) {
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId } });
  if (!invoice) throw Object.assign(new Error('Nota fiscal não encontrada.'), { status: 404 });
  if (invoice.status !== 'AUTHORIZED') {
    throw Object.assign(new Error('Só uma nota autorizada pode ser cancelada.'), { status: 422 });
  }
  // Exigência da SEFAZ: justificativa de 15 a 255 caracteres.
  if (reason.trim().length < 15) {
    throw Object.assign(
      new Error('A justificativa de cancelamento precisa ter ao menos 15 caracteres.'),
      { status: 422 },
    );
  }

  const provider = getNfeProvider(invoice.environment);
  const result = await provider.cancel(invoice.providerRef || invoice.id, reason.trim());

  return prisma.invoice.update({
    where: { id: invoice.id },
    data: { ...statusFields(result), cancelReason: reason.trim() },
  });
}
