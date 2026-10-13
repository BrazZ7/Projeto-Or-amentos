import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit, clientIp } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';

const schema = z.object({ decision: z.enum(['APPROVE', 'REJECT']) });

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  // Endpoint sem autenticação: o limite por IP é o que impede varrer tokens
  // públicos em volume.
  try {
    await enforceRateLimit('publicDecision', clientIp(request));
  } catch (error) {
    return handleApiError(error);
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { publicToken: params.token },
    include: { items: true },
  });
  if (!quote) {
    return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
  }

  if (['APPROVED', 'REJECTED', 'CANCELED'].includes(quote.status)) {
    return NextResponse.json(
      { error: 'Este orçamento já foi respondido e não pode ser alterado.' },
      { status: 409 },
    );
  }

  if (quote.validUntil < new Date()) {
    await prisma.quote.update({ where: { id: quote.id }, data: { status: 'EXPIRED' } });
    return NextResponse.json({ error: 'Este orçamento está vencido.' }, { status: 409 });
  }

  const { decision } = parsed.data;

  if (decision === 'REJECT') {
    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data: { status: 'REJECTED', rejectedAt: new Date() },
    });
    return NextResponse.json({ status: updated.status });
  }

  // Aprovação: além de marcar o orçamento, dá baixa automática no estoque de
  // cada item vinculado a um produto que controla estoque, registrando a
  // movimentação (auditável) dentro da mesma transação da atualização de
  // status — se algo falhar, nada é aplicado parcialmente.
  const itemsWithProduct = quote.items.filter(
    (item): item is typeof item & { productId: string } => item.productId !== null,
  );
  const productIds = itemsWithProduct.map((item) => item.productId);
  const trackedProducts = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, companyId: quote.companyId, trackStock: true },
        select: { id: true },
      })
    : [];
  const trackedProductIds = new Set(trackedProducts.map((p) => p.id));

  const updated = await prisma.$transaction(async (tx) => {
    const updatedQuote = await tx.quote.update({
      where: { id: quote.id },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });

    for (const item of itemsWithProduct) {
      if (!trackedProductIds.has(item.productId)) continue;

      await tx.stockMovement.create({
        data: {
          companyId: quote.companyId,
          productId: item.productId,
          type: 'OUT',
          reason: 'SALE',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          quoteItemId: item.id,
          notes: `Baixa automática pela aprovação do orçamento #${quote.number}`,
        },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    return updatedQuote;
  });

  return NextResponse.json({ status: updated.status });
}
