import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';

const schema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'CANCELED']),
});

// Alterações de status feitas pela própria empresa (marcar como enviado
// manualmente ou cancelar). As transições de aprovação/recusa pelo cliente
// acontecem via /api/public/quotes/[token]/decision.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const { status } = schema.parse(await request.json());

    const quote = await prisma.quote.findFirst({
      where: { id: params.id, companyId: session.user.companyId },
    });
    if (!quote) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }

    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status,
        sentAt: status === 'SENT' ? new Date() : quote.sentAt,
        canceledAt: status === 'CANCELED' ? new Date() : quote.canceledAt,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
