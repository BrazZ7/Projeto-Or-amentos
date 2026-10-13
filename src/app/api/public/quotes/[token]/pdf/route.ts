import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQuotePdf } from '@/lib/pdf/generator';

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const quote = await prisma.quote.findUnique({
    where: { publicToken: params.token },
    include: { items: { orderBy: { order: 'asc' } }, client: true, company: true },
  });

  if (!quote) {
    return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
  }

  const pdfBuffer = await generateQuotePdf(quote, quote.company);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="orcamento-${quote.number}.pdf"`,
    },
  });
}
