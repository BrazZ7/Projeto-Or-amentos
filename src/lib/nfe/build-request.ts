import type { Client, Company, Quote, QuoteItem, Product } from '@prisma/client';
import type { NfeIssueRequest, NfeItemData } from './types';

/**
 * Falha de dado fiscal faltando ou inválido, detectada ANTES de enviar para a
 * SEFAZ. A alternativa seria deixar a nota ser rejeitada e traduzir códigos
 * como "215 - Falha no schema XML", que não dizem nada ao usuário.
 */
export class FiscalDataError extends Error {
  constructor(readonly missing: string[]) {
    super('Dados fiscais incompletos para emitir a NF-e.');
    this.name = 'FiscalDataError';
  }
}

const onlyDigits = (value: string | null | undefined) => (value || '').replace(/\D/g, '');

// CFOP padrão de venda de mercadoria: 5102 dentro do estado, 6102 fora.
function defaultCfop(issuerState: string, recipientState: string) {
  return issuerState.toUpperCase() === recipientState.toUpperCase() ? '5102' : '6102';
}

// No Simples Nacional o item leva CSOSN; no regime normal, CST de ICMS.
function defaultTaxSituation(taxRegime: Company['taxRegime']) {
  return taxRegime === 'NORMAL' ? '00' : '102';
}

type QuoteWithRelations = Quote & { items: (QuoteItem & { product: Product | null })[] };

export function buildNfeRequest({
  quote,
  company,
  client,
  reference,
  number,
}: {
  quote: QuoteWithRelations;
  company: Company;
  client: Client;
  reference: string;
  number: number;
}): NfeIssueRequest {
  const missing: string[] = [];

  const require = <T>(value: T | null | undefined, label: string): T => {
    if (value === null || value === undefined || value === '') missing.push(label);
    return value as T;
  };

  const issuerDocument = onlyDigits(company.document);
  if (issuerDocument.length !== 14) missing.push('CNPJ da empresa (a NF-e exige CNPJ, não CPF)');

  const issuer = {
    document: issuerDocument,
    stateRegistration: require(company.stateRegistration, 'Inscrição Estadual da empresa'),
    legalName: require(company.legalName, 'Razão social da empresa'),
    tradeName: company.tradeName,
    taxRegime: company.taxRegime,
    addressStreet: require(company.addressStreet, 'Logradouro da empresa'),
    addressNumber: require(company.addressNumber, 'Número do endereço da empresa'),
    addressComplement: company.addressComplement,
    addressNeighborhood: require(company.addressNeighborhood, 'Bairro da empresa'),
    addressCity: require(company.addressCity, 'Cidade da empresa'),
    addressState: require(company.addressState, 'UF da empresa'),
    addressZipCode: onlyDigits(require(company.addressZipCode, 'CEP da empresa')),
    cityCode: require(company.cityCode, 'Código IBGE do município da empresa'),
  };

  const recipientDocument = onlyDigits(client.document);
  if (recipientDocument.length !== 11 && recipientDocument.length !== 14) {
    missing.push(`CPF/CNPJ do cliente ${client.name}`);
  }
  if (client.stateRegistrationType === 'CONTRIBUINTE' && !client.stateRegistration) {
    missing.push(`Inscrição Estadual do cliente ${client.name} (marcado como contribuinte de ICMS)`);
  }

  const recipient = {
    document: recipientDocument,
    name: client.name,
    stateRegistration: client.stateRegistration,
    stateRegistrationType: client.stateRegistrationType,
    email: client.email,
    phone: client.phone,
    addressStreet: require(client.addressStreet, `Logradouro do cliente ${client.name}`),
    addressNumber: require(client.addressNumber, `Número do endereço do cliente ${client.name}`),
    addressComplement: client.addressComplement,
    addressNeighborhood: require(client.addressNeighborhood, `Bairro do cliente ${client.name}`),
    addressCity: require(client.addressCity, `Cidade do cliente ${client.name}`),
    addressState: require(client.addressState, `UF do cliente ${client.name}`),
    addressZipCode: onlyDigits(require(client.addressZipCode, `CEP do cliente ${client.name}`)),
    cityCode: require(client.cityCode, `Código IBGE do município do cliente ${client.name}`),
  };

  if (quote.items.length === 0) missing.push('O orçamento não tem itens');

  const items: NfeItemData[] = quote.items.map((item, index) => {
    const product = item.product;
    const label = product?.name || item.description || `item ${index + 1}`;

    // Item avulso (sem produto cadastrado) não tem onde guardar NCM: a NF-e
    // exige o código por item, então o produto precisa existir no catálogo.
    if (!product) {
      missing.push(`"${label}" não está vinculado a um produto cadastrado (NF-e exige NCM por item)`);
    }

    const ncm = onlyDigits(product?.ncm);
    if (product && ncm.length !== 8) {
      missing.push(`NCM do produto "${label}" (8 dígitos)`);
    }

    return {
      code: product?.code || product?.id || String(index + 1),
      description: item.description,
      ncm,
      cest: product?.cest ? onlyDigits(product.cest) : null,
      cfop: product?.cfop || defaultCfop(issuer.addressState || '', recipient.addressState || ''),
      unit: product?.unit || 'un',
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
      discount: Number(item.discount),
      taxOrigin: product?.taxOrigin ?? 0,
      taxSituation: product?.taxSituation || defaultTaxSituation(company.taxRegime),
    };
  });

  if (missing.length > 0) throw new FiscalDataError(missing);

  return {
    reference,
    environment: company.nfeEnvironment,
    operationNature: 'Venda de mercadoria',
    series: company.nfeSeries,
    number,
    issuer,
    recipient,
    items,
    freight: Number(quote.freight),
    totalAmount: Number(quote.total),
    notes: quote.notes,
  };
}
