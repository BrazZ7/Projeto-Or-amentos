import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';
import type { Company, Client, Quote, QuoteItem } from '@prisma/client';
import { ClassicTemplate } from './templates/classic';
import { ModernTemplate } from './templates/modern';
import { ProposalTemplate } from './templates/proposal';
import { FormalTemplate } from './templates/formal';
import { ExecutiveTemplate } from './templates/executive';
import { SidebarTemplate } from './templates/sidebar';
import { CatalogTemplate } from './templates/catalog';
import type { QuotePdfData } from './types';

function buildAddressLine(entity: {
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  addressNeighborhood?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZipCode?: string | null;
}) {
  const parts = [
    [entity.addressStreet, entity.addressNumber].filter(Boolean).join(', '),
    entity.addressComplement,
    entity.addressNeighborhood,
    [entity.addressCity, entity.addressState].filter(Boolean).join('/'),
    entity.addressZipCode,
  ].filter(Boolean);
  return parts.join(' — ');
}

type QuoteWithRelations = Quote & { items: QuoteItem[]; client: Client };

export function buildQuotePdfData(quote: QuoteWithRelations, company: Company): QuotePdfData {
  return {
    number: quote.number,
    quotePrefix: company.quotePrefix,
    status: quote.status,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil,
    items: quote.items.map((item) => ({
      description: item.description,
      imageUrl: item.imageUrl,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      total: Number(item.total),
    })),
    subtotal: Number(quote.subtotal),
    discountType: quote.discountType,
    discountValue: Number(quote.discountValue),
    discountAmount:
      quote.discountType === 'PERCENT'
        ? Number(quote.subtotal) * (Number(quote.discountValue) / 100)
        : Number(quote.discountValue),
    freight: Number(quote.freight),
    total: Number(quote.total),
    paymentTerms: quote.paymentTerms,
    deliveryTerms: quote.deliveryTerms,
    warranty: quote.warranty,
    notes: quote.notes,
    company: {
      legalName: company.legalName,
      tradeName: company.tradeName,
      documentType: company.documentType,
      document: company.document,
      email: company.email,
      phone: company.phone,
      whatsapp: company.whatsapp,
      addressLine: buildAddressLine(company),
      logoUrl: company.logoUrl,
      signatureUrl: company.signatureUrl,
      primaryColor: company.primaryColor,
      secondaryColor: company.secondaryColor,
      fontFamily: company.fontFamily,
      bankName: company.bankName,
      bankAgency: company.bankAgency,
      bankAccount: company.bankAccount,
      pixKey: company.pixKey,
      paymentNotes: company.paymentNotes,
      headerText: company.headerText,
      footerText: company.footerText,
      logoPosition: company.logoPosition,
    },
    client: {
      name: quote.client.name,
      type: quote.client.type,
      document: quote.client.document,
      email: quote.client.email,
      phone: quote.client.phone,
      addressLine: buildAddressLine(quote.client),
    },
  };
}

const templateComponents = {
  CLASSIC: ClassicTemplate,
  MODERN: ModernTemplate,
  PROPOSAL: ProposalTemplate,
  FORMAL: FormalTemplate,
  EXECUTIVE: ExecutiveTemplate,
  SIDEBAR: SidebarTemplate,
  CATALOG: CatalogTemplate,
};

export async function generateQuotePdf(
  quote: QuoteWithRelations,
  company: Company,
): Promise<Buffer> {
  const data = buildQuotePdfData(quote, company);
  const TemplateComponent = templateComponents[quote.template] || ClassicTemplate;
  const element = createElement(TemplateComponent, { data }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);
  return buffer;
}
