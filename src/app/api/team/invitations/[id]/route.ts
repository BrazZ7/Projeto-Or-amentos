import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { handleApiError } from '@/lib/api-utils';

/** Cancela um convite pendente, liberando a vaga do plano. */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole('ADMIN');

    // deleteMany com companyId no filtro: findUnique por id sozinho deixaria
    // uma empresa cancelar convite de outra.
    const { count } = await prisma.invitation.deleteMany({
      where: { id: params.id, companyId: session.user.companyId },
    });

    if (count === 0) {
      return NextResponse.json({ error: 'Convite não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
