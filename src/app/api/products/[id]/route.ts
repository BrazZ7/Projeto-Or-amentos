import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { productSchema } from '@/lib/validations/product';
import { handleApiError } from '@/lib/api-utils';

async function getOwnedProduct(companyId: string, id: string) {
  const product = await prisma.product.findFirst({ where: { id, companyId } });
  if (!product) {
    throw Object.assign(new Error('Produto não encontrado.'), { status: 404 });
  }
  return product;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const product = await getOwnedProduct(session.user.companyId, params.id);
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    await getOwnedProduct(session.user.companyId, params.id);

    const body = await request.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.update({ where: { id: params.id }, data });
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    await getOwnedProduct(session.user.companyId, params.id);

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
