import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/rbac';
import { handleApiError } from '@/lib/api-utils';
import { removerUsuario, alterarCargo, TeamError } from '@/lib/team';

const cargoSchema = z.object({ role: z.enum(['MEMBER', 'ADMIN', 'OWNER']) });

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole('ADMIN');
    const { role } = cargoSchema.parse(await request.json());

    const usuario = await alterarCargo({
      companyId: session.user.companyId,
      alvoId: params.id,
      novoCargo: role,
      quemAlteraId: session.user.id,
      cargoDeQuemAltera: session.user.role,
    });

    return NextResponse.json({ id: usuario.id, role: usuario.role });
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole('ADMIN');

    await removerUsuario({
      companyId: session.user.companyId,
      alvoId: params.id,
      quemRemoveId: session.user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return handleApiError(error);
  }
}
