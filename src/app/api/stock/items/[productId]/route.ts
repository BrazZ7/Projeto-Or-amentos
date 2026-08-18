import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';

const schema = z.object({
  price: z.coerce.number().min(0, 'Preço não pode ser negativo.').optional(),
  cost: z.coerce.number().min(0, 'Custo não pode ser negativo.').optional(),
  /** Quantidade contada em estoque, não a diferença. */
  quantity: z.coerce.number().min(0, 'Quantidade não pode ser negativa.').optional(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * Edição rápida de um item do estoque: preço de venda, custo de compra e
 * quantidade.
 *
 * A quantidade recebida é a CONTAGEM, não um delta — é assim que se pensa ao
 * conferir a prateleira ("tenho 12"), e não "somar 3". A diferença vira uma
 * movimentação de ajuste.
 *
 * O campo stockQuantity nunca é escrito por fora de uma movimentação: o
 * histórico de StockMovement é a fonte da verdade do saldo, e alterar o número
 * direto deixaria um saldo que nenhum registro explica.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } },
) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;
    const data = schema.parse(await request.json());

    const product = await prisma.product.findFirst({
      where: { id: params.productId, companyId },
    });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    const mudouQuantidade =
      data.quantity !== undefined && Number(product.stockQuantity) !== data.quantity;

    if (mudouQuantidade && !product.trackStock) {
      return NextResponse.json(
        { error: 'Este produto não controla estoque. Ative o controle antes de ajustar a quantidade.' },
        { status: 422 },
      );
    }

    const atualizado = await prisma.$transaction(async (tx) => {
      if (mudouQuantidade) {
        const saldoAtual = Number(product.stockQuantity);
        const diferenca = (data.quantity as number) - saldoAtual;

        await tx.stockMovement.create({
          data: {
            companyId,
            productId: product.id,
            type: diferenca > 0 ? 'IN' : 'OUT',
            reason: 'ADJUSTMENT',
            quantity: Math.abs(diferenca),
            unitCost: data.cost ?? product.cost,
            notes:
              data.notes?.trim() ||
              `Ajuste de contagem: de ${saldoAtual} para ${data.quantity} ${product.unit}.`,
          },
        });
      }

      return tx.product.update({
        where: { id: product.id },
        data: {
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.cost !== undefined ? { cost: data.cost } : {}),
          ...(mudouQuantidade ? { stockQuantity: data.quantity } : {}),
        },
      });
    });

    return NextResponse.json({
      id: atualizado.id,
      price: Number(atualizado.price),
      cost: Number(atualizado.cost),
      stockQuantity: Number(atualizado.stockQuantity),
      ajusteRegistrado: mudouQuantidade,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
