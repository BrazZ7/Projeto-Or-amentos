import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';
import { generateQuotePdf } from '@/lib/pdf/generator';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();

    const quote = await prisma.quote.findFirst({
      where: { id: params.id, companyId: session.user.companyId },
      include: { items: { orderBy: { order: 'asc' } }, client: true },
    });
    if (!quote) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }

    const company = await prisma.company.findUniqueOrThrow({ where: { id: session.user.companyId } });
    const pdfBuffer = await generateQuotePdf(quote, company);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="orcamento-${quote.number}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
