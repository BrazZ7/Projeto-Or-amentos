import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ decision: z.enum(['APPROVE', 'REJECT']) });

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({ where: { publicToken: params.token } });
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

  const updated = await prisma.quote.update({
    where: { id: quote.id },
    data:
      decision === 'APPROVE'
        ? { status: 'APPROVED', approvedAt: new Date() }
        : { status: 'REJECTED', rejectedAt: new Date() },
  });

  return NextResponse.json({ status: updated.status });
}
