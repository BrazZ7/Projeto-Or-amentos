import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const quote = await prisma.quote.findUnique({
    where: { publicToken: params.token },
    include: {
      items: { orderBy: { order: 'asc' } },
      client: true,
      company: true,
    },
  });

  if (!quote) {
    return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
  }

  const isFinal = ['APPROVED', 'REJECTED', 'CANCELED'].includes(quote.status);
  const isExpired = !isFinal && quote.validUntil < new Date();

  let status = quote.status;
  if (isExpired) {
    status = 'EXPIRED';
  } else if (status === 'SENT') {
    status = 'VIEWED';
  }

  if (status !== quote.status || !quote.viewedAt) {
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status, viewedAt: quote.viewedAt ?? new Date() },
    });
  }

  return NextResponse.json({
    number: quote.number,
    quotePrefix: quote.company.quotePrefix,
    status,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil,
    subtotal: Number(quote.subtotal),
    discountType: quote.discountType,
    discountValue: Number(quote.discountValue),
    freight: Number(quote.freight),
    total: Number(quote.total),
    paymentTerms: quote.paymentTerms,
    deliveryTerms: quote.deliveryTerms,
    warranty: quote.warranty,
    notes: quote.notes,
    items: quote.items.map((item) => ({
      description: item.description,
      imageUrl: item.imageUrl,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      total: Number(item.total),
    })),
    client: {
      name: quote.client.name,
    },
    company: {
      legalName: quote.company.legalName,
      tradeName: quote.company.tradeName,
      logoUrl: quote.company.logoUrl,
      primaryColor: quote.company.primaryColor,
      whatsapp: quote.company.whatsapp,
      email: quote.company.email,
      phone: quote.company.phone,
    },
  });
}
