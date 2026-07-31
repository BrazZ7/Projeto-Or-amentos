import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { quoteSchema } from '@/lib/validations/quote';
import { handleApiError } from '@/lib/api-utils';
import { assertWithinPlanLimit } from '@/lib/plan-limits';
import { calculateQuoteTotals } from '@/lib/calculations';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const status = request.nextUrl.searchParams.get('status');

    const quotes = await prisma.quote.findMany({
      where: {
        companyId: session.user.companyId,
        ...(status ? { status: status as never } : {}),
      },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;
    const body = await request.json();
    const data = quoteSchema.parse(body);

    await assertWithinPlanLimit(companyId, 'quote');

    const client = await prisma.client.findFirst({ where: { id: data.clientId, companyId } });
    if (!client) {
      return NextResponse.json({ error: 'Cliente inválido.' }, { status: 422 });
    }

    const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });

    const totals = calculateQuoteTotals({
      items: data.items,
      discountType: data.discountType,
      discountValue: data.discountValue,
      freight: data.freight,
    });

    const quote = await prisma.$transaction(async (tx) => {
      const updatedCompany = await tx.company.update({
        where: { id: companyId },
        data: { nextQuoteNumber: { increment: 1 } },
      });
      const number = updatedCompany.nextQuoteNumber - 1;

      return tx.quote.create({
        data: {
          companyId,
          number,
          clientId: data.clientId,
          status: data.status || 'DRAFT',
          issueDate: new Date(data.issueDate),
          validUntil: new Date(data.validUntil),
          subtotal: totals.subtotal,
          discountType: data.discountType,
          discountValue: data.discountValue,
          freight: totals.freight,
          total: totals.total,
          paymentTerms: data.paymentTerms,
          deliveryTerms: data.deliveryTerms,
          warranty: data.warranty,
          notes: data.notes,
          template: data.template || company.pdfTemplate,
          items: {
            create: data.items.map((item, index) => ({
              productId: item.productId || null,
              description: item.description,
              imageUrl: item.imageUrl,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              total: totals.itemTotals[index],
              order: index,
            })),
          },
        },
        include: { items: true, client: true },
      });
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
