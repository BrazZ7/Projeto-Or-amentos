import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { quoteSchema } from '@/lib/validations/quote';
import { handleApiError } from '@/lib/api-utils';
import { calculateQuoteTotals } from '@/lib/calculations';
import { assertTemplateAllowed } from '@/lib/plan-limits';

async function getOwnedQuote(companyId: string, id: string) {
  const quote = await prisma.quote.findFirst({ where: { id, companyId } });
  if (!quote) {
    throw Object.assign(new Error('Orçamento não encontrado.'), { status: 404 });
  }
  return quote;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    await getOwnedQuote(session.user.companyId, params.id);

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { order: 'asc' } }, client: true },
    });

    return NextResponse.json(quote);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;
    const existing = await getOwnedQuote(companyId, params.id);

    const body = await request.json();
    const data = quoteSchema.parse(body);

    const client = await prisma.client.findFirst({ where: { id: data.clientId, companyId } });
    if (!client) {
      return NextResponse.json({ error: 'Cliente inválido.' }, { status: 422 });
    }

    // Só barra a troca para um modelo premium. O formulário reenvia o modelo
    // atual do orçamento, então validar sempre impediria uma empresa que
    // rebaixou o plano de salvar qualquer edição em orçamentos antigos.
    if (data.template && data.template !== existing.template) {
      await assertTemplateAllowed(companyId, data.template);
    }

    const totals = calculateQuoteTotals({
      items: data.items,
      discountType: data.discountType,
      discountValue: data.discountValue,
      freight: data.freight,
    });

    const quote = await prisma.$transaction(async (tx) => {
      await tx.quoteItem.deleteMany({ where: { quoteId: existing.id } });

      return tx.quote.update({
        where: { id: existing.id },
        data: {
          clientId: data.clientId,
          status: data.status || existing.status,
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
          template: data.template || existing.template,
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

    return NextResponse.json(quote);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    await getOwnedQuote(session.user.companyId, params.id);

    await prisma.quote.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
