import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { clientSchema } from '@/lib/validations/client';
import { handleApiError } from '@/lib/api-utils';

async function getOwnedClient(companyId: string, id: string) {
  const client = await prisma.client.findFirst({ where: { id, companyId } });
  if (!client) {
    throw Object.assign(new Error('Cliente não encontrado.'), { status: 404 });
  }
  return client;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const client = await getOwnedClient(session.user.companyId, params.id);
    return NextResponse.json(client);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    await getOwnedClient(session.user.companyId, params.id);

    const body = await request.json();
    const data = clientSchema.parse(body);

    const client = await prisma.client.update({ where: { id: params.id }, data });
    return NextResponse.json(client);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    await getOwnedClient(session.user.companyId, params.id);

    await prisma.client.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
