import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { requireRole } from '@/lib/rbac';
import { handleApiError } from '@/lib/api-utils';
import { refreshInvoice, cancelInvoice } from '@/lib/nfe/issue';

/** Reconsulta o desfecho na SEFAZ — a autorização é assíncrona. */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const invoice = await refreshInvoice(session.user.companyId, params.id);
    return NextResponse.json(invoice);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole('ADMIN');
    const body = await request.json().catch(() => ({}));
    const invoice = await cancelInvoice(
      session.user.companyId,
      params.id,
      typeof body.reason === 'string' ? body.reason : '',
    );
    return NextResponse.json(invoice);
  } catch (error) {
    return handleApiError(error);
  }
}
