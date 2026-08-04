import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { stockMovementSchema } from '@/lib/validations/stock';
import { handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const productId = request.nextUrl.searchParams.get('productId');

    const movements = await prisma.stockMovement.findMany({
      where: {
        companyId: session.user.companyId,
        ...(productId ? { productId } : {}),
      },
      include: { product: { select: { id: true, name: true, unit: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(movements);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;
    const body = await request.json();
    const data = stockMovementSchema.parse(body);

    const product = await prisma.product.findFirst({
      where: { id: data.productId, companyId },
    });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }
    if (!product.trackStock) {
      return NextResponse.json(
        { error: 'Este produto não controla estoque.' },
        { status: 422 },
      );
    }

    const delta = data.type === 'IN' ? data.quantity : -data.quantity;

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          companyId,
          productId: product.id,
          type: data.type,
          reason: data.reason,
          quantity: data.quantity,
          unitCost: data.unitCost ?? null,
          unitPrice: data.unitPrice ?? null,
          notes: data.notes,
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: { increment: delta },
          ...(data.type === 'IN' && data.reason === 'PURCHASE' && data.unitCost != null
            ? { cost: data.unitCost }
            : {}),
        },
      }),
    ]);

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
