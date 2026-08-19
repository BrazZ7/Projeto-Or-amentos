import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { handleApiError } from '@/lib/api-utils';
import { issueInvoiceForQuote } from '@/lib/nfe/issue';
import { FiscalDataError } from '@/lib/nfe';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole('ADMIN');
    const invoice = await issueInvoiceForQuote(session.user.companyId, params.id);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    // A lista de campos faltando é o dado mais útil da resposta: sem ela o
    // usuário só veria "dados incompletos" e teria que adivinhar o quê.
    if (error instanceof FiscalDataError) {
      return NextResponse.json({ error: error.message, missing: error.missing }, { status: 422 });
    }
    return handleApiError(error);
  }
}
