import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { productSchema } from '@/lib/validations/product';
import { handleApiError } from '@/lib/api-utils';
import { assertWithinPlanLimit } from '@/lib/plan-limits';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const search = request.nextUrl.searchParams.get('q');

    const products = await prisma.product.findMany({
      where: {
        companyId: session.user.companyId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const data = productSchema.parse(body);

    await assertWithinPlanLimit(session.user.companyId, 'product');

    const product = await prisma.product.create({
      data: { ...data, companyId: session.user.companyId },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
