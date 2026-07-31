import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { clientSchema } from '@/lib/validations/client';
import { handleApiError } from '@/lib/api-utils';
import { assertWithinPlanLimit } from '@/lib/plan-limits';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const search = request.nextUrl.searchParams.get('q');

    const clients = await prisma.client.findMany({
      where: {
        companyId: session.user.companyId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { document: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const data = clientSchema.parse(body);

    await assertWithinPlanLimit(session.user.companyId, 'client');

    const client = await prisma.client.create({
      data: { ...data, companyId: session.user.companyId },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
